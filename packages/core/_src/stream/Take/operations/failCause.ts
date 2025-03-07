import { TakeInternal } from "@effect/core/stream/Take/operations/_internal/TakeInternal"

/**
 * Creates a failing `Take<E, never>` with the specified cause.
 *
 * @tsplus static effect/core/stream/Take.Ops failCause
 */
export function failCause<E>(cause: Cause<E>): Take<E, never> {
  return new TakeInternal(Exit.failCause(cause.map(Maybe.some)))
}
