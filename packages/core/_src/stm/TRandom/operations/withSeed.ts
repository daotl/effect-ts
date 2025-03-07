import { LiveTRandom } from "@effect/core/stm/TRandom/operations/live"

/**
 * @tsplus static effect/core/stm/TRandom.Ops withSeed
 */
export function withSeed(seed: number) {
  return <R, E, A>(stm: STM<R, E, A>): STM<Exclude<R, TRandom>, E, A> =>
    stm.provideServiceSTM(
      TRandom.Tag,
      TRef.make(new PCGRandom(seed).getState()).map((_) => new LiveTRandom(_))
    )
}
