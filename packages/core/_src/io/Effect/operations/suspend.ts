/**
 * Returns a lazily constructed effect, whose construction may itself require
 * effects. When no environment is required (i.e., when `R == unknown`) it is
 * conceptually equivalent to `flatten(succeed(io))`.
 *
 * @tsplus static effect/core/io/Effect.Ops suspend
 */
export function suspend<R, E, A>(
  f: LazyArg<Effect<R, E, A>>
): Effect<R, unknown, A> {
  return Effect.attempt(f).flatMap(identity)
}
