/**
 * Takes the specified number of elements from the queue. If there are fewer
 * than the specified number of elements available, it retries until they
 * become available.
 *
 * @tsplus static effect/core/stm/TQueue.Aspects takeN
 * @tsplus pipeable effect/core/stm/TQueue takeN
 */
export function takeN(n: number) {
  return <A>(self: TQueue<A>): STM<never, never, Chunk<A>> => self.takeBetween(n, n)
}
