/**
 * Returns the `FiberId` of the fiber executing the effect that calls this
 * method.
 *
 * @tsplus static effect/core/io/Effect.Ops fiberId
 */
export const fiberId: Effect<never, never, FiberId> = Effect.withFiberRuntime((state) =>
  Effect.succeed(state.id)
)
