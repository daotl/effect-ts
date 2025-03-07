/**
 * Accesses the environment of the stream in the context of a stream.
 *
 * @tsplus static effect/core/stream/Stream.Ops environmentWithStream
 */
export function environmentWithStream<R0, R, E, A>(
  f: (env: Env<R0>) => Stream<R, E, A>
): Stream<R0 | R, E, A> {
  return Stream.environment<R0>().flatMap(f)
}
