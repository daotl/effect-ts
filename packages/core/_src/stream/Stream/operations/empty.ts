import { StreamInternal } from "@effect/core/stream/Stream/operations/_internal/StreamInternal"

/**
 * The empty stream.
 *
 * @tsplus static effect/core/stream/Stream.Ops empty
 */
export const empty: Stream<never, never, never> = new StreamInternal(
  Channel.write(Chunk.empty())
)
