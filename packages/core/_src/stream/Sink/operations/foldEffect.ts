import { SinkInternal } from "@effect/core/stream/Sink/operations/_internal/SinkInternal"

/**
 * A sink that effectfully folds its inputs with the provided function,
 * termination predicate and initial state.
 *
 * @tsplus static effect/core/stream/Sink.Ops foldEffect
 */
export function foldEffect<R, E, In, S>(
  z: S,
  cont: Predicate<S>,
  f: (s: S, input: In) => Effect<R, E, S>
): Sink<R, E, In, In, S> {
  return Sink.suspend(new SinkInternal(reader(z, cont, f)))
}

function reader<R, E, S, In>(
  z: S,
  cont: Predicate<S>,
  f: (s: S, input: In) => Effect<R, E, S>
): Channel<R, E, Chunk<In>, unknown, E, Chunk<In>, S> {
  if (!cont(z)) {
    return Channel.succeed(z)
  }
  return Channel.readWith(
    (chunk: Chunk<In>) =>
      Channel.fromEffect(foldChunkSplitEffect(z, chunk, cont, f)).flatMap(
        ([nextS, leftovers]) =>
          leftovers.fold(reader(nextS, cont, f), (leftover) => Channel.write(leftover).as(nextS))
      ),
    (err) => Channel.fail(err),
    () => Channel.succeed(z)
  )
}

function foldChunkSplitEffect<R, E, S, In>(
  z: S,
  chunk: Chunk<In>,
  cont: Predicate<S>,
  f: (s: S, input: In) => Effect<R, E, S>
): Effect<R, E, readonly [S, Maybe<Chunk<In>>]> {
  return foldEffectInternal(z, chunk, cont, f, 0, chunk.length)
}

function foldEffectInternal<R, E, S, In>(
  z: S,
  chunk: Chunk<In>,
  cont: Predicate<S>,
  f: (s: S, input: In) => Effect<R, E, S>,
  index: number,
  length: number
): Effect<R, E, readonly [S, Maybe<Chunk<In>>]> {
  if (index === length) {
    return Effect.succeed([z, Maybe.none])
  }
  return f(z, chunk.unsafeGet(index)).flatMap((z1) =>
    cont(z1)
      ? foldEffectInternal<R, E, S, In>(z1, chunk, cont, f, index + 1, length)
      : Effect.succeed([z1, Maybe.some(chunk.drop(index + 1))])
  )
}
