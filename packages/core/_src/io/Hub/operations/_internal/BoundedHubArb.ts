import type { AtomicHub } from "@effect/core/io/Hub/operations/_internal/AtomicHub"
import type { Subscription } from "@effect/core/io/Hub/operations/_internal/Subscription"

export class BoundedHubArb<A> implements AtomicHub<A> {
  array: Array<A>
  publisherIndex = 0
  subscribers: Array<number>
  subscriberCount = 0
  subscribersIndex = 0

  readonly capacity: number

  constructor(requestedCapacity: number) {
    this.array = Array.from({ length: requestedCapacity })
    this.subscribers = Array.from({ length: requestedCapacity })
    this.capacity = requestedCapacity
  }

  get isEmpty(): boolean {
    return this.publisherIndex === this.subscribersIndex
  }

  get isFull(): boolean {
    return this.publisherIndex === this.subscribersIndex + this.capacity
  }

  publish(a: A): boolean {
    if (this.isFull) {
      return false
    }

    if (this.subscriberCount !== 0) {
      const index = this.publisherIndex % this.capacity

      this.array[index] = a
      this.subscribers[index] = this.subscriberCount
      this.publisherIndex += 1
    }

    return true
  }

  publishAll(as: Collection<A>): Chunk<A> {
    const asArray = Chunk.from(as)
    const n = asArray.size
    const size = this.publisherIndex - this.subscribersIndex
    const available = this.capacity - size
    const forHub = Math.min(n, available)

    if (forHub === 0) {
      return asArray
    }

    let iteratorIndex = 0
    const publishAllIndex = this.publisherIndex + forHub

    while (this.publisherIndex !== publishAllIndex) {
      const a = asArray.unsafeGet(iteratorIndex++)
      const index = this.publisherIndex % this.capacity
      this.array[index] = a
      this.subscribers[index] = this.subscriberCount
      this.publisherIndex += 1
    }

    return asArray.drop(iteratorIndex - 1)
  }

  get size(): number {
    return this.publisherIndex - this.subscribersIndex
  }

  slide(): void {
    if (this.subscribersIndex !== this.publisherIndex) {
      const index = this.subscribersIndex % this.capacity

      this.array[index] = null as unknown as A
      this.subscribers[index] = 0
      this.subscribersIndex += 1
    }
  }

  subscribe(): Subscription<A> {
    this.subscriberCount += 1

    return new BoundedHubArbSubscription(this, this.publisherIndex, false)
  }
}

class BoundedHubArbSubscription<A> implements Subscription<A> {
  constructor(
    private self: BoundedHubArb<A>,
    private subscriberIndex: number,
    private unsubscribed: boolean
  ) {
  }

  get isEmpty(): boolean {
    return (
      this.unsubscribed ||
      this.self.publisherIndex === this.subscriberIndex ||
      this.self.publisherIndex === this.self.subscribersIndex
    )
  }

  poll<D>(default_: D): A | D {
    if (this.unsubscribed) {
      return default_
    }

    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex)

    if (this.subscriberIndex !== this.self.publisherIndex) {
      const index = this.subscriberIndex % this.self.capacity
      const a = this.self.array[index]!

      this.self.subscribers[index] -= 1

      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = null as unknown as A
        this.self.subscribersIndex += 1
      }

      this.subscriberIndex += 1
      return a
    }

    return default_
  }

  pollUpTo(n: number): Chunk<A> {
    if (this.unsubscribed) {
      return Chunk.empty()
    }

    this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex)
    const size = this.self.publisherIndex - this.subscriberIndex
    const toPoll = Math.min(n, size)

    if (toPoll <= 0) {
      return Chunk.empty()
    }

    const builder = Chunk.builder<A>()
    const pollUpToIndex = this.subscriberIndex + toPoll

    while (this.subscriberIndex !== pollUpToIndex) {
      const index = this.subscriberIndex % this.self.capacity
      const a = this.self.array[index] as A

      this.self.subscribers[index] -= 1

      if (this.self.subscribers[index] === 0) {
        this.self.array[index] = null as unknown as A
        this.self.subscribersIndex += 1
      }

      builder.append(a)
      this.subscriberIndex += 1
    }

    return builder.build()
  }

  get size() {
    if (this.unsubscribed) {
      return 0
    }

    return (
      this.self.publisherIndex -
      Math.max(this.subscriberIndex, this.self.subscribersIndex)
    )
  }

  unsubscribe(): void {
    if (!this.unsubscribed) {
      this.unsubscribed = true
      this.self.subscriberCount -= 1
      this.subscriberIndex = Math.max(this.subscriberIndex, this.self.subscribersIndex)

      while (this.subscriberIndex !== this.self.publisherIndex) {
        const index = this.subscriberIndex % this.self.capacity
        this.self.subscribers[index] -= 1

        if (this.self.subscribers[index] === 0) {
          this.self.array[index] = null as unknown as A
          this.self.subscribersIndex += 1
        }

        this.subscriberIndex += 1
      }
    }
  }
}
