/**
 * Returns a fiber that has already succeeded with the specified value.
 *
 * @tsplus static effect/core/io/Fiber.Ops succeed
 */
export function succeed<A>(a: A): Fiber<never, A> {
  return Fiber.done(Exit.succeed(a))
}
