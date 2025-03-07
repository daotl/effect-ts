/**
 * Returns a stream that always fails with the specified `Cause`.
 *
 * @tsplus static effect/core/stream/Stream.Ops failCauseSync
 */
export function failCauseSync<E>(cause: LazyArg<Cause<E>>): Stream<never, E, never> {
  return Stream.fromEffect(Effect.failCauseSync(cause))
}
