import {
  concreteStream,
  StreamInternal
} from "@effect/core/stream/Stream/operations/_internal/StreamInternal"

/**
 * Exposes the underlying chunks of the stream as a stream of chunks of
 * elements.
 *
 * @tsplus getter effect/core/stream/Stream chunks
 */
export function chunks<R, E, A>(
  self: Stream<R, E, A>
): Stream<R, E, Chunk<A>> {
  concreteStream(self)
  return new StreamInternal(self.channel.mapOut(Chunk.single))
}
