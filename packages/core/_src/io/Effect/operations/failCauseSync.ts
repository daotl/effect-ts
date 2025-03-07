/**
 * Returns an effect that models failure with the specified `Cause`.
 *
 * @tsplus static effect/core/io/Effect.Ops failCauseSync
 */
export function failCauseSync<E>(cause: LazyArg<Cause<E>>): Effect<never, E, never> {
  return Effect.sync(cause).flatMap(Effect.failCause)
}
