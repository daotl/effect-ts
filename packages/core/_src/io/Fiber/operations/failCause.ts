/**
 * Creates a `Fiber` that has already failed with the specified cause.
 *
 * @tsplus static effect/core/io/Fiber.Ops failCause
 */
export function failCause<E>(cause: Cause<E>): Fiber<E, never> {
  return Fiber.done(Exit.failCause(cause))
}
