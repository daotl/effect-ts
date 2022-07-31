import { _In, _Out, QueueProto } from "@effect/core/io/Queue/definition"
import { unsafeCompleteDeferred } from "@effect/core/io/Queue/operations/_internal/unsafeCompleteDeferred"
import { unsafeCompleteTakers } from "@effect/core/io/Queue/operations/_internal/unsafeCompleteTakers"
import { unsafeOfferAll } from "@effect/core/io/Queue/operations/_internal/unsafeOfferAll"
import { unsafePollAll } from "@effect/core/io/Queue/operations/_internal/unsafePollAll"
import { unsafePollN } from "@effect/core/io/Queue/operations/_internal/unsafePollN"
import { unsafeRemove } from "@effect/core/io/Queue/operations/_internal/unsafeRemove"
import type { Strategy } from "@effect/core/io/Queue/operations/strategy"
import type { State } from "@effect/core/io/Scope/ReleaseMap/_internal/State"
import { Exited } from "@effect/core/io/Scope/ReleaseMap/_internal/State"

// -----------------------------------------------------------------------------
// forEach
// -----------------------------------------------------------------------------

/**
 * Applies the function `f` to each element of the `Collection<A>` and returns
 * the results in a new `Chunk<B>`.
 *
 * For a parallel version of this method, see `forEachPar`. If you do not need
 * the results, see `forEachDiscard` for a more efficient implementation.
 *
 * @tsplus static effect/core/io/Effect.Ops forEach
 */
export function forEach<A, R, E, B>(
  as: LazyArg<Collection<A>>,
  f: (a: A) => Effect<R, E, B>
): Effect<R, E, Chunk<B>> {
  return Effect.suspendSucceed(() => {
    const acc: B[] = []
    return Effect.forEachDiscard(as, (a) =>
      f(a).map((b) => {
        acc.push(b)
      })).map(() => Chunk.from(acc))
  })
}

// -----------------------------------------------------------------------------
// forEachWithIndex
// -----------------------------------------------------------------------------

/**
 * Same as `forEach`, except that the function `f` is supplied
 * a second argument that corresponds to the index (starting from 0)
 * of the current element being iterated over.
 *
 * @tsplus static effect/core/io/Effect.Ops forEachWithIndex
 */
export function forEachWithIndex<A, R, E, B>(
  as: LazyArg<Collection<A>>,
  f: (a: A, i: number) => Effect<R, E, B>
): Effect<R, E, Chunk<B>> {
  return Effect.suspendSucceed(() => {
    let index = 0
    const acc: B[] = []
    return Effect.forEachDiscard(as, (a) =>
      f(a, index).map((b) => {
        acc.push(b)
        index++
      })).map(() => Chunk.from(acc))
  })
}

// -----------------------------------------------------------------------------
// forEachDiscard
// -----------------------------------------------------------------------------

/**
 * Applies the function `f` to each element of the `Collection<A>` and runs
 * produced effects sequentially.
 *
 * Equivalent to `unit(forEach(as, f))`, but without the cost of building
 * the list of results.
 *
 * @tsplus static effect/core/io/Effect.Ops forEachDiscard
 */
export function forEachDiscard<R, E, A, X>(
  as: LazyArg<Collection<A>>,
  f: (a: A) => Effect<R, E, X>
): Effect<R, E, void> {
  return Effect.sync(as).flatMap((collection) =>
    forEachDiscardLoop(collection[Symbol.iterator](), f)
  )
}

function forEachDiscardLoop<R, E, A, X>(
  iterator: Iterator<A, any, undefined>,
  f: (a: A) => Effect<R, E, X>
): Effect<R, E, void> {
  const next = iterator.next()
  return next.done ? Effect.unit : f(next.value) > forEachDiscardLoop(iterator, f)
}

// -----------------------------------------------------------------------------
// forEachPar
// -----------------------------------------------------------------------------

/**
 * Applies the function `f` to each element of the `Collection<A>` in parallel,
 * and returns the results in a new `Chunk<B>`.
 *
 * For a sequential version of this method, see `forEach`.
 *
 * @tsplus static effect/core/io/Effect.Ops forEachPar
 */
export function forEachPar<R, E, A, B>(
  as: LazyArg<Collection<A>>,
  f: (a: A) => Effect<R, E, B>
): Effect<R, E, Chunk<B>> {
  return Effect.parallelismWith((option) =>
    option.fold(
      () => forEachParUnbounded(as, f),
      (n) => forEachParN(as, n, f)
    )
  )
}

/**
 * Applies the function `f` to each element of the `Collection<A>` in parallel,
 * and returns the results in a new `Chunk<B>`.
 */
function forEachParUnbounded<R, E, A, B>(
  as: LazyArg<Collection<A>>,
  f: (a: A) => Effect<R, E, B>
): Effect<R, E, Chunk<B>> {
  return Effect.suspendSucceed(
    Effect.sync<B[]>([]).flatMap((array) =>
      forEachParUnboundedDiscard(
        as().map((a, n) => [a, n] as [A, number]),
        ([a, n]) =>
          Effect.suspendSucceed(f(a)).flatMap((b) =>
            Effect.sync(() => {
              array[n] = b
            })
          )
      ).map(() => Chunk.from(array))
    )
  )
}

function forEachParN<R, E, A, B>(
  as: LazyArg<Collection<A>>,
  n: number,
  f: (a: A) => Effect<R, E, B>
): Effect<R, E, Chunk<B>> {
  return Effect.suspendSucceed<R, E, Chunk<B>>(() => {
    if (n < 1) {
      return Effect.dieMessage(
        `Unexpected nonpositive value "${n}" passed to foreachParN`
      )
    }

    const as0 = Chunk.from(as())
    const size = as0.size

    if (size === 0) {
      return Effect.succeed(Chunk.empty())
    }

    function worker(
      queue: Queue<Tuple<[A, number]>>,
      array: Array<B>
    ): Effect<R, E, void> {
      return queue
        .takeUpTo(1)
        .map((_) => _.head)
        .flatMap((_) =>
          _.fold(
            () => Effect.unit,
            ({ tuple: [a, n] }) =>
              f(a)
                .tap((b) =>
                  Effect.sync(() => {
                    array[n] = b
                  })
                )
                .flatMap(() => worker(queue, array))
          )
        )
    }

    return Effect.sync(new Array<B>(size)).flatMap((array) =>
      makeBoundedQueue<Tuple<[A, number]>>(size).flatMap((queue) =>
        queue
          .offerAll(as0.zipWithIndex)
          .flatMap(() =>
            forEachParUnboundedDiscard(worker(queue, array).replicate(n), identity).map(
              () => Chunk.from(array)
            )
          )
      )
    )
  })
}

// -----------------------------------------------------------------------------
// forEachParWithIndex
// -----------------------------------------------------------------------------

/**
 * Same as `forEachPar_`, except that the function `f` is supplied
 * a second argument that corresponds to the index (starting from 0)
 * of the current element being iterated over.
 *
 * @tsplus static effect/core/io/Effect.Ops forEachParWithIndex
 */
export function forEachParWithIndex<R, E, A, B>(
  as: LazyArg<Collection<A>>,
  f: (a: A, i: number) => Effect<R, E, B>
): Effect<R, E, Chunk<B>> {
  return Effect.suspendSucceed(
    Effect.sync<B[]>([]).flatMap((array) =>
      Effect.forEachParDiscard(
        as().map((a, n) => [a, n] as [A, number]),
        ([a, n]) =>
          Effect.suspendSucceed(f(a, n)).flatMap((b) =>
            Effect.sync(() => {
              array[n] = b
            })
          )
      ).map(() => Chunk.from(array))
    )
  )
}

// -----------------------------------------------------------------------------
// forEachParDiscard
// -----------------------------------------------------------------------------

/**
 * Applies the function `f` to each element of the `Collection<A>` and runs
 * produced effects in parallel, discarding the results.
 *
 * For a sequential version of this method, see `forEachDiscard`.
 *
 * Optimized to avoid keeping full tree of effects, so that method could be
 * able to handle large input sequences. Additionally, interrupts all effects
 * on any failure.
 *
 * @tsplus static effect/core/io/Effect.Ops forEachParDiscard
 */
export function forEachParDiscard<R, E, A, X>(
  as: LazyArg<Collection<A>>,
  f: (a: A) => Effect<R, E, X>
): Effect<R, E, void> {
  return Effect.parallelismWith((option) =>
    option.fold(
      () => forEachParUnboundedDiscard(as, f),
      (n) => forEachParNDiscard(as, n, f)
    )
  )
}

function forEachParUnboundedDiscard<R, E, A, X>(
  as: LazyArg<Collection<A>>,
  f: (a: A) => Effect<R, E, X>
): Effect<R, E, void> {
  return Effect.suspendSucceed<R, E, void>(() => {
    const bs = Chunk.from(as())
    const size = bs.size

    if (size === 0) {
      return Effect.unit
    }

    return Effect.uninterruptibleMask(({ restore }) => {
      const deferred = Deferred.unsafeMake<void, void>(FiberId.none)
      const ref = new AtomicNumber(0)

      return Effect.transplant((graft) =>
        Effect.forEach(bs, (a) =>
          graft(
            restore(Effect.suspendSucceed(f(a))).foldCauseEffect(
              (cause) => deferred.fail(undefined) > Effect.failCause(cause),
              () => {
                if (ref.incrementAndGet() === size) {
                  deferred.unsafeDone(Effect.unit)
                  return Effect.unit
                } else {
                  return Effect.unit
                }
              }
            )
          ).forkDaemon)
      ).flatMap((fibers) =>
        restore(deferred.await).foldCauseEffect(
          (cause) =>
            forEachParUnbounded(fibers, (fiber) => fiber.interrupt).flatMap(
              (exits) => {
                const collected = Exit.collectAllPar(exits)
                if (collected._tag === "Some" && collected.value._tag === "Failure") {
                  return Effect.failCauseSync(
                    Cause.both(cause.stripFailures, collected.value.cause)
                  )
                }
                return Effect.failCauseSync(cause.stripFailures)
              }
            ),
          (_) => Effect.forEachDiscard(fibers, (fiber) => fiber.inheritRefs)
        )
      )
    })
  })
}

function forEachParNDiscard<R, E, A, X>(
  as: LazyArg<Collection<A>>,
  n: number,
  f: (a: A) => Effect<R, E, X>
): Effect<R, E, void> {
  return Effect.suspendSucceed(() => {
    const as0 = as()
    const bs = Chunk.from(as0)
    const size = bs.size

    if (size === 0) {
      return Effect.unit
    }

    function worker(queue: Queue<A>): Effect<R, E, void> {
      return queue
        .takeUpTo(1)
        .map((chunk) => chunk.head)
        .flatMap((option) =>
          option.fold(
            () => Effect.unit,
            (a) => f(a).flatMap(() => worker(queue))
          )
        )
    }

    return makeBoundedQueue<A>(size).flatMap((queue) =>
      queue
        .offerAll(as0)
        .flatMap(() => forEachParUnboundedDiscard(worker(queue).replicate(n), identity))
    )
  })
}

// -----------------------------------------------------------------------------
// forEachExec
// -----------------------------------------------------------------------------

/**
 * Applies the function `f` to each element of the `Collection<A>` and returns
 * the result in a new `Chunk<B>` using the specified execution strategy.
 *
 * @tsplus static effect/core/io/Effect.Ops forEachExec
 */
export function forEachExec<R, E, A, B>(
  as: LazyArg<Collection<A>>,
  f: (a: A) => Effect<R, E, B>,
  strategy: ExecutionStrategy
): Effect<R, E, Chunk<B>> {
  return Effect.suspendSucceed(() => {
    switch (strategy._tag) {
      case "Parallel": {
        return Effect.forEachPar(as, f).withParallelismUnbounded
      }
      case "ParallelN": {
        return Effect.forEachPar(as, f).withParallelism(strategy.n)
      }
      case "Sequential": {
        return Effect.forEach(as, f)
      }
    }
  })
}

// -----------------------------------------------------------------------------
// collectAll
// -----------------------------------------------------------------------------

/**
 * Evaluate each effect in the structure from left to right, and collect the
 * results. For a parallel version, see `collectAllPar`.
 *
 * @tsplus static effect/core/io/Effect.Ops collectAll
 */
export function collectAll<R, E, A>(as: LazyArg<Collection<Effect<R, E, A>>>) {
  return Effect.forEach(as, identity)
}

// -----------------------------------------------------------------------------
// collectAllPar
// -----------------------------------------------------------------------------

/**
 * Evaluate each effect in the structure in parallel, and collect the
 * results. For a sequential version, see `collectAll`.
 *
 * @tsplus static effect/core/io/Effect.Ops collectAllPar
 */
export function collectAllPar<R, E, A>(
  as: LazyArg<Collection<Effect<R, E, A>>>
): Effect<R, E, Chunk<A>> {
  return Effect.forEachPar(as, identity)
}

// -----------------------------------------------------------------------------
// collectAllDiscard
// -----------------------------------------------------------------------------

/**
 * Evaluate each effect in the structure from left to right, and discard the
 * results. For a parallel version, see `collectAllParDiscard`.
 *
 * @tsplus static effect/core/io/Effect.Ops collectAllDiscard
 */
export function collectAllDiscard<R, E, A>(
  as: LazyArg<Collection<Effect<R, E, A>>>
): Effect<R, E, void> {
  return Effect.forEachDiscard(as, identity)
}

// -----------------------------------------------------------------------------
// collectAllParDiscard
// -----------------------------------------------------------------------------

/**
 * Evaluate each effect in the structure in parallel, and discard the
 * results. For a sequential version, see `collectAllDiscard`.
 *
 * @tsplus static effect/core/io/Effect.Ops collectAllParDiscard
 */
export function collectAllParDiscard<R, E, A>(
  as: LazyArg<Collection<Effect<R, E, A>>>
): Effect<R, E, void> {
  return Effect.forEachParDiscard(as, identity)
}

// -----------------------------------------------------------------------------
// collectAllWith
// -----------------------------------------------------------------------------

/**
 * Evaluate each effect in the structure with `collectAll`, and collect
 * the results with given partial function.
 *
 * @tsplus static effect/core/io/Effect.Ops collectAllWith
 */
export function collectAllWith<R, E, A, B>(
  as: LazyArg<Collection<Effect<R, E, A>>>,
  pf: (a: A) => Maybe<B>
): Effect<R, E, Chunk<B>> {
  return Effect.collectAll(as).map((chunk) => chunk.collect(pf))
}

// -----------------------------------------------------------------------------
// collectAllWithPar
// -----------------------------------------------------------------------------

/**
 * Evaluate each effect in the structure with `collectAll`, and collect
 * the results with given partial function.
 *
 * @tsplus static effect/core/io/Effect.Ops collectAllWithPar
 */
export function collectAllWithPar<R, E, A, B>(
  as: LazyArg<Collection<Effect<R, E, A>>>,
  pf: (a: A) => Maybe<B>
): Effect<R, E, Chunk<B>> {
  return Effect.collectAllPar(as).map((chunk) => chunk.collect(pf))
}

// -----------------------------------------------------------------------------
// collectAllSuccesses
// -----------------------------------------------------------------------------

/**
 * Evaluate and run each effect in the structure and collect discarding failed ones.
 *
 * @tsplus static effect/core/io/Effect.Ops collectAllSuccesses
 */
export function collectAllSuccesses<R, E, A>(
  as: LazyArg<Collection<Effect<R, E, A>>>
): Effect<R, never, Chunk<A>> {
  return Effect.collectAllWith(
    as().map((effect) => effect.exit),
    (exit) => (exit._tag === "Success" ? Maybe.some(exit.value) : Maybe.none)
  )
}

// -----------------------------------------------------------------------------
// collectAllSuccessesPar
// -----------------------------------------------------------------------------

/**
 * Evaluate and run each effect in the structure in parallel, and collect discarding failed ones.
 *
 * @tsplus static effect/core/io/Effect.Ops collectAllSuccessesPar
 */
export function collectAllSuccessesPar<R, E, A>(
  as: LazyArg<Collection<Effect<R, E, A>>>
): Effect<R, never, Chunk<A>> {
  return Effect.collectAllWithPar(
    as().map((effect) => effect.exit),
    (exit) => (exit._tag === "Success" ? Maybe.some(exit.value) : Maybe.none)
  )
}

// -----------------------------------------------------------------------------
// Fiber
// -----------------------------------------------------------------------------

/**
 * Joins all fibers, awaiting their _successful_ completion.
 * Attempting to join a fiber that has erred will result in
 * a catchable error, _if_ that error does not result from interruption.
 */
export function fiberJoinAll<E, A>(
  as: LazyArg<Collection<Fiber<E, A>>>
): Effect<never, E, Chunk<A>> {
  return fiberWaitAll(as)
    .flatMap((exit) => Effect.done(exit))
    .tap(() => Effect.forEach(as, (fiber) => fiber.inheritRefs))
}

/**
 * Awaits on all fibers to be completed, successfully or not.
 */
export function fiberWaitAll<E, A>(
  as: LazyArg<Collection<Fiber<E, A>>>
): Effect<never, never, Exit<E, Chunk<A>>> {
  return Effect.forEachPar(as, (fiber) => fiber.await.flatMap((exit) => Effect.done(exit))).exit
}

// -----------------------------------------------------------------------------
// ReleaseMap
// -----------------------------------------------------------------------------

/**
 * Releases all the finalizers in the releaseMap according to the ExecutionStrategy.
 */
export function releaseMapReleaseAll(
  self: ReleaseMap,
  ex: Exit<unknown, unknown>,
  execStrategy: ExecutionStrategy
): Effect<never, never, unknown> {
  return self.ref
    .modify((s): Tuple<[Effect<never, never, unknown>, State]> => {
      switch (s._tag) {
        case "Exited": {
          return Tuple(Effect.unit, s)
        }
        case "Running": {
          switch (execStrategy._tag) {
            case "Sequential": {
              return Tuple(
                Effect.forEach(
                  Array.from(s.finalizers()).reverse(),
                  ([_, f]) => s.update(f)(ex).exit
                ).flatMap((
                  results
                ) => Effect.done(Exit.collectAll(results).getOrElse(Exit.unit))),
                new Exited(s.nextKey, ex, s.update)
              )
            }
            case "Parallel": {
              return Tuple(
                Effect.forEachPar(
                  Array.from(s.finalizers()).reverse(),
                  ([_, f]) => s.update(f)(ex).exit
                ).flatMap((
                  results
                ) => Effect.done(Exit.collectAllPar(results).getOrElse(Exit.unit))),
                new Exited(s.nextKey, ex, s.update)
              )
            }
            case "ParallelN": {
              return Tuple(
                Effect.forEachPar(
                  Array.from(s.finalizers()).reverse(),
                  ([_, f]) => s.update(f)(ex).exit
                )
                  .flatMap((results) =>
                    Effect.done(Exit.collectAllPar(results).getOrElse(Exit.unit))
                  )
                  .withParallelism(execStrategy.n) as Effect<never, never, unknown>,
                new Exited(s.nextKey, ex, s.update)
              )
            }
          }
        }
      }
    })
    .flatten
}

// -----------------------------------------------------------------------------
// ReleaseMap
// -----------------------------------------------------------------------------

export function makeBoundedQueue<A>(
  requestedCapacity: number
): Effect<never, never, Queue<A>> {
  return Effect.sync(MutableQueue.bounded<A>(requestedCapacity)).flatMap((queue) =>
    createQueue(queue, new BackPressureStrategy())
  )
}

export function createQueue<A>(
  queue: MutableQueue<A>,
  strategy: Strategy<A>
): Effect<never, never, Queue<A>> {
  return Deferred.make<never, void>().map((deferred) =>
    unsafeCreateQueue(
      queue,
      MutableQueue.unbounded(),
      deferred,
      new AtomicBoolean(false),
      strategy
    )
  )
}

const UnsafeQueueProto: any = {
  ...QueueProto,
  get capacity() {
    return (this.queue as MutableQueue<unknown>).capacity
  },
  get size() {
    return Effect.suspendSucceed(
      (this.shutdownFlag as AtomicBoolean).get
        ? Effect.interrupt
        : Effect.succeed(
          (this.queue as MutableQueue<unknown>).size -
            (this.takers as MutableQueue<Deferred<never, unknown>>).size +
            (this.strategy as Strategy<unknown>).surplusSize
        )
    )
  },
  get awaitShutdown() {
    return (this.shutdownHook as Deferred<never, void>).await
  },
  get isShutdown() {
    return Effect.sync(() => (this.shutdownFlag as AtomicBoolean).get)
  },
  get shutdown() {
    return Effect.suspendSucceedWith((_, fiberId) => {
      ;(this.shutdownFlag as AtomicBoolean).set(true)
      return Effect.whenEffect(
        (this.shutdownHook as Deferred<never, void>).succeed(undefined),
        () =>
          Effect.forEachParDiscard(
            unsafePollAll(
              (this.takers as MutableQueue<Deferred<never, unknown>>) as MutableQueue<
                Deferred<never, unknown>
              >
            ),
            (deferred) => deferred.interruptAs(fiberId)
          ) > ((this.strategy as Strategy<unknown>) as Strategy<unknown>).shutdown
      ).unit
    }).uninterruptible
  },
  offer(a: unknown) {
    return Effect.suspendSucceed(() => {
      if ((this.shutdownFlag as AtomicBoolean).get) {
        return Effect.interrupt
      }
      let noRemaining: boolean
      if ((this.queue as MutableQueue<unknown>).isEmpty) {
        const taker = (this.takers as MutableQueue<Deferred<never, unknown>>).poll(
          EmptyMutableQueue
        )
        if (taker !== EmptyMutableQueue) {
          unsafeCompleteDeferred(taker, a)
          noRemaining = true
        } else {
          noRemaining = false
        }
      } else {
        noRemaining = false
      }
      if (noRemaining) {
        return Effect.succeed(true)
      }
      // Not enough takers, offer to the queue
      const succeeded = (this.queue as MutableQueue<unknown>).offer(a)
      unsafeCompleteTakers(
        this.strategy as Strategy<unknown>,
        this.queue as MutableQueue<unknown>,
        this.takers as MutableQueue<Deferred<never, unknown>>
      )
      return succeeded
        ? Effect.succeed(true)
        : (this.strategy as Strategy<unknown>).handleSurplus(
          Chunk.single(a),
          this.queue as MutableQueue<unknown>,
          this.takers as MutableQueue<Deferred<never, unknown>>,
          this.shutdownFlag as AtomicBoolean
        )
    })
  },
  offerAll(as: Collection<unknown>) {
    return Effect.suspendSucceed(() => {
      if ((this.shutdownFlag as AtomicBoolean).get) {
        return Effect.interrupt
      }
      const as0 = Chunk.from(as)
      const pTakers = (this.queue as MutableQueue<unknown>).isEmpty
        ? unsafePollN(
          (this.takers as MutableQueue<Deferred<never, unknown>>) as MutableQueue<
            Deferred<never, unknown>
          >,
          as0.size
        )
        : Chunk.empty<Deferred<never, unknown>>()
      const {
        tuple: [forTakers, remaining]
      } = as0.splitAt(pTakers.size)
      pTakers.zip(forTakers).forEach(({ tuple: [taker, item] }) => {
        unsafeCompleteDeferred(taker, item)
      })
      if (remaining.isEmpty) {
        return Effect.succeed(true)
      }
      // Not enough takers, offer to the queue
      const surplus = unsafeOfferAll(this.queue as MutableQueue<unknown>, remaining)
      unsafeCompleteTakers(
        this.strategy as Strategy<unknown>,
        this.queue as MutableQueue<unknown>,
        this.takers as MutableQueue<Deferred<never, unknown>>
      )
      return surplus.isEmpty
        ? Effect.succeed(true)
        : (this.strategy as Strategy<unknown>).handleSurplus(
          surplus,
          this.queue as MutableQueue<unknown>,
          this.takers as MutableQueue<Deferred<never, unknown>>,
          this.shutdownFlag as AtomicBoolean
        )
    })
  },
  get take() {
    return Effect.suspendSucceedWith((_, fiberId) => {
      if ((this.shutdownFlag as AtomicBoolean).get) {
        return Effect.interrupt
      }
      const item = (this.queue as MutableQueue<unknown>).poll(EmptyMutableQueue)
      if (item !== EmptyMutableQueue) {
        ;(this.strategy as Strategy<unknown>).unsafeOnQueueEmptySpace(
          this.queue as MutableQueue<unknown>,
          this.takers as MutableQueue<Deferred<never, unknown>>
        )
        return Effect.succeed(item)
      } else {
        // Add the deferred to takers, then:
        // - Try to take again in case a value was added since
        // - Wait for the deferred to be completed
        // - Clean up resources in case of interruption
        const deferred = Deferred.unsafeMake<never, unknown>(fiberId)
        return Effect.suspendSucceed(() => {
          ;(this.takers as MutableQueue<Deferred<never, unknown>>).offer(deferred)
          unsafeCompleteTakers(
            this.strategy as Strategy<unknown>,
            this.queue as MutableQueue<unknown>,
            this.takers as MutableQueue<Deferred<never, unknown>>
          )
          return (this.shutdownFlag as AtomicBoolean).get ? Effect.interrupt : deferred.await
        }).onInterrupt(() => {
          return Effect.sync(
            unsafeRemove(this.takers as MutableQueue<Deferred<never, unknown>>, deferred)
          )
        })
      }
    })
  },
  get takeAll() {
    return Effect.suspendSucceed(() =>
      (this.shutdownFlag as AtomicBoolean).get
        ? Effect.interrupt
        : Effect.sync(() => {
          const as = unsafePollAll(this.queue as MutableQueue<unknown>)
          ;(this.strategy as Strategy<unknown>).unsafeOnQueueEmptySpace(
            this.queue as MutableQueue<unknown>,
            this.takers as MutableQueue<Deferred<never, unknown>>
          )
          return as
        })
    )
  },
  takeUpTo(n: number) {
    return Effect.suspendSucceed(() =>
      (this.shutdownFlag as AtomicBoolean).get
        ? Effect.interrupt
        : Effect.sync(() => {
          const as = unsafePollN(this.queue as MutableQueue<unknown>, n)
          ;(this.strategy as Strategy<unknown>).unsafeOnQueueEmptySpace(
            this.queue as MutableQueue<unknown>,
            this.takers as MutableQueue<Deferred<never, unknown>>
          )
          return as
        })
    )
  }
}

export function unsafeCreateQueue<A>(
  queue: MutableQueue<A>,
  takers: MutableQueue<Deferred<never, A>>,
  shutdownHook: Deferred<never, void>,
  shutdownFlag: AtomicBoolean,
  strategy: Strategy<A>
): Queue<A> {
  return Object.setPrototypeOf({
    queue,
    takers,
    shutdownHook,
    shutdownFlag,
    strategy
  }, UnsafeQueueProto)
}

export function makeBackPressureStrategy<A>() {
  return new BackPressureStrategy<A>()
}

export class BackPressureStrategy<A> implements Strategy<A> {
  /**
   * - `A` is an item to add
   * - `Deferred<never, boolean>` is the deferred completing the whole `offerAll`
   * - `boolean` indicates if it's the last item to offer (deferred should be
   *    completed once this item is added)
   */
  private putters = MutableQueue.unbounded<Tuple<[A, Deferred<never, boolean>, boolean]>>()

  handleSurplus(
    as: Chunk<A>,
    queue: MutableQueue<A>,
    takers: MutableQueue<Deferred<never, A>>,
    isShutdown: AtomicBoolean
  ): Effect<never, never, boolean> {
    return Effect.suspendSucceedWith((_, fiberId) => {
      const deferred = Deferred.unsafeMake<never, boolean>(fiberId)

      return Effect.suspendSucceed(() => {
        this.unsafeOffer(as, deferred)
        this.unsafeOnQueueEmptySpace(queue, takers)
        unsafeCompleteTakers(this, queue, takers)
        return isShutdown.get ? Effect.interrupt : deferred.await
      }).onInterrupt(() => Effect.sync(this.unsafeRemove(deferred)))
    })
  }

  unsafeRemove(deferred: Deferred<never, boolean>): void {
    unsafeOfferAll(
      this.putters,
      unsafePollAll(this.putters).filter(({ tuple: [, _] }) => _ !== deferred)
    )
  }

  unsafeOffer(as: Chunk<A>, deferred: Deferred<never, boolean>): void {
    let bs = as

    while (bs.size > 0) {
      const head = bs.unsafeGet(0)!

      bs = bs.drop(1)

      if (bs.size === 0) {
        this.putters.offer(Tuple(head, deferred, true))
      } else {
        this.putters.offer(Tuple(head, deferred, false))
      }
    }
  }

  unsafeOnQueueEmptySpace(
    queue: MutableQueue<A>,
    takers: MutableQueue<Deferred<never, A>>
  ): void {
    let keepPolling = true

    while (keepPolling && !queue.isFull) {
      const putter = this.putters.poll(EmptyMutableQueue)

      if (putter !== EmptyMutableQueue) {
        const offered = queue.offer(putter.get(0))

        if (offered && putter.get(2)) {
          unsafeCompleteDeferred(putter.get(1), true)
        } else if (!offered) {
          unsafeOfferAll(this.putters, unsafePollAll(this.putters).prepend(putter))
        }
        unsafeCompleteTakers(this, queue, takers)
      } else {
        keepPolling = false
      }
    }
  }

  get surplusSize(): number {
    return this.putters.size
  }

  get shutdown(): Effect<never, never, void> {
    return Do(($) => {
      const fiberId = $(Effect.fiberId)
      const putters = $(Effect.sync(unsafePollAll(this.putters)))
      $(Effect.forEachPar(
        putters,
        ({ tuple: [_, promise, lastItem] }) => lastItem ? promise.interruptAs(fiberId) : Effect.unit
      ))
    })
  }
}
