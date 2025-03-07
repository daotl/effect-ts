/**
 * Feeds the error or output services of this layer into the input of either
 * the specified `failure` or `success` layers, resulting in a new layer with
 * the inputs of this layer, and the error or outputs of the specified layer.
 *
 * @tsplus static effect/core/io/Layer.Aspects foldLayer
 * @tsplus pipeable effect/core/io/Layer foldLayer
 */
export function foldLayer<E, R2, E2, A2, A, R3, E3, A3>(
  failure: (e: E) => Layer<R2, E2, A2>,
  success: (a: Env<A>) => Layer<R3, E3, A3>
) {
  return <R>(self: Layer<R, E, A>): Layer<R | R2 | R3, E2 | E3, A2 & A3> =>
    self.foldCauseLayer(
      (cause) => cause.failureOrCause.fold(failure, (cause) => Layer.failCause(cause)),
      success
    )
}
