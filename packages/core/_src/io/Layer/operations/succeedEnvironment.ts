/**
 * Constructs a layer from the specified value, which must return one or more
 * services.
 *
 * @tsplus static effect/core/io/Layer.Ops succeedEnvironment
 */
export function succeedEnvironment<A>(a: Env<A>): Layer<never, never, A> {
  return Layer.fromEffectEnvironment(Effect.succeed(a))
}
