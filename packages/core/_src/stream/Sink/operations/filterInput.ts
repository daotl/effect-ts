/**
 * Filter the input of this sink using the specified predicate.
 *
 * @tsplus static effect/core/stream/Sink.Aspects filterInput
 * @tsplus pipeable effect/core/stream/Sink filterInput
 */
export function filterInput<In, In1 extends In, In2 extends In1>(
  f: Refinement<In1, In2>
): <R, E, L, Z>(self: Sink<R, E, In, L, Z>) => Sink<R, E, In2, L, Z>
export function filterInput<In, In1 extends In>(
  f: Predicate<In1>
): <R, E, L, Z>(self: Sink<R, E, In, L, Z>) => Sink<R, E, In1, L, Z>
export function filterInput<In, In1 extends In>(f: Predicate<In1>) {
  return <R, E, L, Z>(self: Sink<R, E, In, L, Z>): Sink<R, E, In1, L, Z> =>
    self.contramapChunks((chunk) => chunk.filter(f))
}
