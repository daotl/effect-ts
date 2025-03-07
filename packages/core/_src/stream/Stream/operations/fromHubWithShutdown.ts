import { DEFAULT_CHUNK_SIZE } from "@effect/core/stream/Stream/definition"

/**
 * Creates a stream from a subscription to a hub.
 *
 * The hub will be shut down once the stream is closed.
 *
 * @param maxChunkSize
 *   Maximum number of queued elements to put in one chunk in the stream.
 *
 * @tsplus static effect/core/stream/Stream.Ops fromHubWithShutdown
 */
export function fromHubWithShutdown<A>(
  hub: Hub<A>,
  maxChunkSize = DEFAULT_CHUNK_SIZE
): Stream<never, never, A> {
  return Stream.fromHub(hub, maxChunkSize).ensuring(hub.shutdown)
}
