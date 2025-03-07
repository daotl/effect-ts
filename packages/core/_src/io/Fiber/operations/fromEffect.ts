/**
 * Lifts an `Effect` into a `Fiber`.
 *
 * @tsplus static effect/core/io/Fiber.Ops fromEffect
 */
export function fromEffect<E, A>(
  effect: Effect<never, E, A>
): Effect<never, never, Fiber<E, A>> {
  return effect.exit.map(Fiber.done)
}
