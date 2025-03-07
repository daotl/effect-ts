/**
 * Merges a variable list of streams in a non-deterministic fashion. Up to `n`
 * streams may be consumed in parallel and up to `outputBuffer` chunks may be
 * buffered by this operator.
 *
 * @tsplus static effect/core/stream/Stream.Ops mergeAll
 */
export function mergeAll(n: number, outputBuffer = 16) {
  return <R, E, A>(...streams: Array<Stream<R, E, A>>): Stream<R, E, A> =>
    Stream.fromCollection(streams).flattenPar(n, outputBuffer)
}
