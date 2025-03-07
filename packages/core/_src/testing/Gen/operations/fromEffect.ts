/**
 * Constructs a generator from an effect that constructs a value.
 *
 * @tsplus static effect/core/testing/Gen.Ops fromEffect
 */
export function fromEffect<R, A>(effect: Effect<R, never, A>): Gen<R, A> {
  return Gen.fromEffectSample(effect.map(
    (a) => Sample.noShrink(a) as unknown as Sample<R, A>
  ))
}
