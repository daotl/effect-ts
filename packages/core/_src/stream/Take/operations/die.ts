import { TakeInternal } from "@effect/core/stream/Take/operations/_internal/TakeInternal"

/**
 * Creates a failing `Take<never, never>` with the specified defect.
 *
 * @tsplus static effect/core/stream/Take.Ops die
 */
export function die(defect: unknown): Take<never, never> {
  return new TakeInternal(Exit.die(defect))
}
