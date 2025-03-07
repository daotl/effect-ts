import type { Success } from "@effect/core/io/Exit/definition"

/**
 * Determines if the `Exit` result is a success.
 *
 * @tsplus fluent effect/core/io/Exit isSuccess
 */
export function isSuccess<E, A>(self: Exit<E, A>): self is Success<A> {
  return self._tag === "Success"
}
