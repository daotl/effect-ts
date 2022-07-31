/**
 * Reduces an `Collection<Effect<R, E, A>>` to a single `Effect<R, E, A>`, working
 * sequentially.
 *
 * @tsplus static effect/core/io/Effect.Ops reduceAll
 */
export function reduceAll<R, E, A>(
  a: LazyArg<Effect<R, E, A>>,
  as: LazyArg<Collection<Effect<R, E, A>>>,
  f: (acc: A, a: A) => A
): Effect<R, E, A> {
  return Effect.suspendSucceed(as().reduce(a(), (acc, a) => acc.zipWith(a, f)))
}
