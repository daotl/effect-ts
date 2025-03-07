/**
 * Fails with `e` if the predicate fails.
 *
 * @tsplus static effect/core/io/Effect.Aspects filterOrFail
 * @tsplus pipeable effect/core/io/Effect filterOrFail
 */
export function filterOrFail<E1, A, B extends A>(
  f: Refinement<A, B>,
  error: LazyArg<E1>
): <R, E>(self: Effect<R, E, A>) => Effect<R, E | E1, B>
export function filterOrFail<E1, A>(
  f: Predicate<A>,
  error: LazyArg<E1>
): <R, E>(self: Effect<R, E, A>) => Effect<R, E | E1, A>
export function filterOrFail<E1, A>(
  f: Predicate<A>,
  error: LazyArg<E1>
) {
  return <R, E>(self: Effect<R, E, A>): Effect<R, E | E1, A> =>
    Effect.$.filterOrElse(f, Effect.failSync(error))(self)
}
