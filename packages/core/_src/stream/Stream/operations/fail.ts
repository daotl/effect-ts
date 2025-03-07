/**
 * Returns a stream that always fails with the specified `error`.
 *
 * @tsplus static effect/core/stream/Stream.Ops fail
 */
export function fail<E>(error: E): Stream<never, E, never> {
  return Stream.fromEffect(Effect.fail(error))
}
