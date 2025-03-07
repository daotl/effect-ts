/**
 * Retreives the `Random` service from the environment and uses it to run the
 * specified workflow.
 *
 * @tsplus static effect/core/io/Effect.Ops randomWith
 */
export function randomWith<R, E, A>(f: (random: Random) => Effect<R, E, A>): Effect<R, E, A> {
  return DefaultServices.currentServices.getWith((services) => f(services.get(Random.Tag)))
}
