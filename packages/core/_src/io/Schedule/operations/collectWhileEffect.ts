/**
 * A schedule that recurs as long as the effectful condition holds, collecting
 * all inputs into a list.
 *
 * @tsplus static effect/core/io/Schedule.Ops collectWhileEffect
 */
export function collectWhileEffect<Env, A>(
  f: (a: A) => Effect<Env, never, boolean>
): Schedule<readonly [void, Chunk<A>], Env, A, Chunk<A>> {
  return Schedule.recurWhileEffect(f).collectAll
}
