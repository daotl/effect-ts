/**
 * Merges an `Collection<Effect<R, E, A>>` to a single `Effect<R, E, B>`, working
 * sequentially.
 *
 * @tsplus static effect/core/io/Effect.Ops mergeAll
 */
export function mergeAll<R, E, A, B>(
  as: Collection<Effect<R, E, A>>,
  zero: B,
  f: (b: B, a: A) => B
): Effect<R, E, B> {
  return as.reduce(Effect.succeed(zero) as Effect<R, E, B>, (acc, a) => acc.zipWith(a, f))
}
