/**
 * Feeds elements of type `A` to `f` until it succeeds. Returns first success
 * or the accumulation of all errors.
 *
 * @tsplus static effect/core/io/Effect.Ops validateFirst
 */
export function validateFirst<R, E, A, B>(
  as: Collection<A>,
  f: (a: A) => Effect<R, E, B>
): Effect<R, Chunk<E>, B> {
  return Effect.forEach(as, (a) => f(a).flip).flip
}
