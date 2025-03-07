import { StreamInternal } from "@effect/core/stream/Stream/operations/_internal/StreamInternal"

/**
 * Like `unfoldChunk`, but allows the emission of values to end one step
 * further than the unfolding of the state. This is useful for embedding
 * paginated APIs, hence the name.
 *
 * @tsplus static effect/core/stream/Stream.Ops paginateChunk
 */
export function paginateChunk<S, A>(
  s: S,
  f: (s: S) => readonly [Chunk<A>, Maybe<S>]
): Stream<never, never, A> {
  return new StreamInternal(Channel.suspend(loop(s, f)))
}

function loop<S, A>(
  s: S,
  f: (s: S) => readonly [Chunk<A>, Maybe<S>]
): Channel<never, unknown, unknown, unknown, never, Chunk<A>, unknown> {
  const [as, maybeS] = f(s)
  return maybeS.fold(
    Channel.write(as).zipRight(Channel.unit),
    (s) => Channel.write(as).zipRight(loop(s, f))
  )
}
