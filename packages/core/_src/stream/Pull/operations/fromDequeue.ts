/**
 * @tsplus static effect/core/stream/Pull.Ops fromDequeue
 */
export function fromDequeue<E, A>(queue: Dequeue<Take<E, A>>): Effect<never, Maybe<E>, Chunk<A>> {
  return queue.take.flatMap((take) => take.done)
}
