import { _A, RefSym } from "@effect/core/io/Ref/definition"

export class UnsafeAPI<A> {
  constructor(readonly value: AtomicReference<A>) {}

  get get(): A {
    return this.value.get
  }

  getAndSet(a: A): A {
    const current = this.value.get
    this.value.set(a)
    return current
  }

  getAndUpdate(f: (a: A) => A): A {
    const current = this.value.get
    this.value.set(f(current))
    return current
  }

  getAndUpdateSome(pf: (a: A) => Maybe<A>): A {
    const current = this.value.get
    const opt = pf(current)
    if (opt.isSome()) {
      this.value.set(opt.value)
    }
    return current
  }

  modify<B>(f: (a: A) => readonly [B, A]): B {
    const current = this.value.get
    const [b, a] = f(current)
    this.value.set(a)
    return b
  }

  modifySome<B>(fallback: B, pf: (a: A) => Maybe<readonly [B, A]>): B {
    const current = this.value.get
    const tuple = pf(current).getOrElse([fallback, current] as const)
    this.value.set(tuple[1])
    return tuple[0]
  }

  set(a: A): void {
    return this.value.set(a)
  }

  update(f: (a: A) => A): void {
    const current = this.value.get
    this.value.set(f(current))
  }

  updateAndGet(f: (a: A) => A): A {
    const current = this.value.get
    const next = f(current)
    this.value.set(next)
    return next
  }

  updateSome(pf: (a: A) => Maybe<A>): void {
    const current = this.value.get
    const opt = pf(current)
    if (opt.isSome()) {
      this.value.set(opt.value)
    }
  }

  updateSomeAndGet(pf: (a: A) => Maybe<A>): A {
    const current = this.value.get
    const next = pf(current)
    if (next.isSome()) {
      this.value.set(next.value)
      return next.value
    }
    return current
  }
}

export class AtomicInternal<A> implements Ref<A> {
  constructor(readonly unsafe: UnsafeAPI<A>) {}

  get [_A](): (_: never) => A {
    return (a) => a
  }

  /**
   * Internal Discriminator
   */
  get [RefSym](): RefSym {
    return RefSym
  }

  get get(): Effect<never, never, A> {
    return Effect.sync(this.unsafe.get)
  }

  modify<B>(
    this: this,
    f: (a: A) => readonly [B, A]
  ): Effect<never, never, B> {
    return Effect.sync(this.unsafe.modify(f))
  }

  set(this: this, a: A): Effect<never, never, void> {
    return Effect.sync(this.unsafe.set(a))
  }

  getAndSet(this: this, a: A): Effect<never, never, A> {
    return this.modify((v) => [v, a] as const)
  }

  getAndUpdate(this: this, f: (a: A) => A): Effect<never, never, A> {
    return this.modify((v) => [v, f(v)] as const)
  }

  getAndUpdateSome(
    this: this,
    pf: (a: A) => Maybe<A>
  ): Effect<never, never, A> {
    return this.modify((v) => [v, pf(v).getOrElse(v)] as const)
  }

  modifySome<B>(
    this: this,
    fallback: B,
    pf: (a: A) => Maybe<readonly [B, A]>
  ): Effect<never, never, B> {
    return this.modify((v) => pf(v).getOrElse([fallback, v] as const))
  }

  update(this: this, f: (a: A) => A): Effect<never, never, void> {
    return this.modify((v) => [undefined as void, f(v)] as const)
  }

  updateAndGet(this: this, f: (a: A) => A): Effect<never, never, A> {
    return this.modify(v => {
      const result = f(v)

      return [result, result] as const
    })
  }

  updateSome(
    this: this,
    pf: (a: A) => Maybe<A>
  ): Effect<never, never, void> {
    return this.modify((v) => [undefined as void, pf(v).getOrElse(v)] as const)
  }

  updateSomeAndGet(
    this: this,
    pf: (a: A) => Maybe<A>
  ): Effect<never, never, A> {
    return this.modify(v => {
      const result = pf(v).getOrElse(v)
      return [result, result] as const
    })
  }
}
