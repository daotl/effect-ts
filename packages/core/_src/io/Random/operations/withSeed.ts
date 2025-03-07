import { LiveRandom } from "@effect/core/io/Random/operations/live"

/**
 * @tsplus static effect/core/io/Random.Ops withSeed
 */
export function withSeed(seed: number) {
  return <R, E, A>(effect: Effect<R, E, A>): Effect<R, E, A> =>
    Effect.sync(new LiveRandom(seed)).flatMap((random) =>
      effect.apply(DefaultServices.currentServices.locally(Env(Random.Tag, random)))
    )
}
