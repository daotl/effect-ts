import { InternalTDequeue } from "@effect/core/stm/THub/operations/_internal/InternalTDequeue"

/**
 * @tsplus static effect/core/stm/THub/TDequeue.Ops make
 * @tsplus static effect/core/stm/THub/TDequeue.Ops __call
 */
export function make<A>(
  hubSize: TRef<number>,
  publisherHead: TRef<TRef<THub.Node<A>>>,
  publisherTail: TRef<TRef<THub.Node<A>>>,
  requestedCapacity: number,
  subscriberCount: TRef<number>,
  subscribers: TRef<HashSet<TRef<TRef<THub.Node<A>>>>>
): STM<never, never, THub.TDequeue<A>> {
  return Do(($) => {
    const currentPublisherTail = $(publisherTail.get)
    const subscriberHead = $(TRef.make(currentPublisherTail))
    const currentSubscriberCount = $(subscriberCount.get)
    const currentSubscribers = $(subscribers.get)

    $(subscriberCount.set(currentSubscriberCount + 1))
    $(subscribers.set(currentSubscribers + subscriberHead))

    return new InternalTDequeue(
      hubSize,
      publisherHead,
      requestedCapacity,
      subscriberHead,
      subscriberCount,
      subscribers
    )
  })
}
