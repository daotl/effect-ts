/**
 * Returns a new effect that will not succeed with its value before first
 * interrupting all child fibers forked by the effect.
 *
 * @tsplus getter effect/core/io/Effect interruptAllChildren
 */
export function interruptAllChildren<R, E, A>(self: Effect<R, E, A>): Effect<R, E, A> {
  return self.ensuringChildren((chunk) => Fiber.interruptAll(chunk))
}
