/**
 * @tsplus static effect/core/stream/Pull.Ops empty
 */
export function empty<A>(): Effect<never, never, Chunk<A>> {
  return Effect.sync(Chunk.empty<A>())
}
