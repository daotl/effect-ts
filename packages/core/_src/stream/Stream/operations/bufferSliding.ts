import { bufferSignal } from "@effect/core/stream/Stream/operations/_internal/bufferSignal"
import {
  concreteStream,
  StreamInternal
} from "@effect/core/stream/Stream/operations/_internal/StreamInternal"

/**
 * Allows a faster producer to progress independently of a slower consumer by
 * buffering up to `capacity` elements in a sliding queue.
 *
 * This combinator destroys the chunking structure. It's recommended to use
 * rechunk afterwards.
 *
 * Note: prefer capacities that are powers of 2 for better performance.
 *
 * @tsplus static effect/core/stream/Stream.Aspects bufferSliding
 * @tsplus pipeable effect/core/stream/Stream bufferSliding
 */
export function bufferSliding(capacity: number) {
  return <R, E, A>(self: Stream<R, E, A>): Stream<R, E, A> => {
    const queue = Effect.acquireRelease(
      Queue.sliding<readonly [Take<E, A>, Deferred<never, void>]>(capacity),
      (queue) => queue.shutdown
    )
    const stream = self.rechunk(1)
    concreteStream(stream)
    return new StreamInternal(bufferSignal(queue, stream.channel))
  }
}
