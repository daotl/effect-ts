import { SinkInternal } from "@effect/core/stream/Sink/operations/_internal/SinkInternal"

/**
 * A sink that folds its inputs with the provided function, termination
 * predicate and initial state.
 *
 * @tsplus static effect/core/stream/Sink.Ops fold
 */
export function fold<In, S>(
  z: S,
  cont: Predicate<S>,
  f: (s: S, input: In) => S
): Sink<never, never, In, In, S> {
  return Sink.suspend(new SinkInternal(reader(z, cont, f)))
}

function reader<S, In>(
  z: S,
  cont: Predicate<S>,
  f: (s: S, input: In) => S
): Channel<never, never, Chunk<In>, unknown, never, Chunk<In>, S> {
  return !cont(z)
    ? Channel.succeed(z)
    : Channel.readWith(
      (chunk: Chunk<In>) => {
        const [nextS, leftovers] = foldChunkSplit(z, chunk, cont, f)
        return leftovers.isNonEmpty
          ? Channel.write(leftovers).as(nextS)
          : reader<S, In>(nextS, cont, f)
      },
      (err) => Channel.fail(err),
      () => Channel.succeed(z)
    )
}

function foldChunkSplit<S, In>(
  z: S,
  chunk: Chunk<In>,
  cont: Predicate<S>,
  f: (s: S, input: In) => S
): readonly [S, Chunk<In>] {
  return foldInternal(z, chunk, cont, f, 0, chunk.length)
}

function foldInternal<S, In>(
  z: S,
  chunk: Chunk<In>,
  cont: Predicate<S>,
  f: (s: S, input: In) => S,
  index: number,
  length: number
): readonly [S, Chunk<In>] {
  if (index === length) {
    return [z, Chunk.empty<In>()]
  }
  const z1 = f(z, chunk.unsafeGet(index))
  return cont(z1)
    ? foldInternal<S, In>(z1, chunk, cont, f, index + 1, length)
    : [z1, chunk.drop(index + 1)]
}
