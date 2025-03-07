import { TakeInternal } from "@effect/core/stream/Take/operations/_internal/TakeInternal"

/**
 * End-of-stream marker.
 *
 * @tsplus static effect/core/stream/Take.Ops end
 */
export const end: Take<never, never> = new TakeInternal(Exit.fail(Maybe.none))
