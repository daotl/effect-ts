/**
 * Like `mergeAll`, but runs all streams concurrently.
 *
 * @tsplus static effect/core/stream/Stream.Ops mergeAllUnbounded
 */
export function mergeAllUnbounded(outputBuffer = 16) {
  return <R, E, A>(...streams: Array<Stream<R, E, A>>): Stream<R, E, A> =>
    Stream.fromCollection(streams).flattenPar(Number.MAX_SAFE_INTEGER, outputBuffer)
}
