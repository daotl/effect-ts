import {
  concreteSink,
  SinkInternal
} from "@effect/core/stream/Sink/operations/_internal/SinkInternal"

/**
 * Repeatedly runs the sink for as long as its results satisfy the predicate
 * `p`. The sink's results will be accumulated using the stepping function
 * `f`.
 *
 * @tsplus static effect/core/stream/Sink.Aspects collectAllWhileWith
 * @tsplus pipeable effect/core/stream/Sink collectAllWhileWith
 */
export function collectAllWhileWith<Z, S>(
  z: S,
  p: Predicate<Z>,
  f: (s: S, z: Z) => S
) {
  return <R, E, In, L extends In>(self: Sink<R, E, In, L, Z>): Sink<R, E, In, L, S> => {
    concreteSink(self)
    return new SinkInternal(
      Channel.fromEffect(Ref.make(Chunk.empty<In>()).zip(Ref.make(false))).flatMap(
        ([leftoversRef, upstreamDoneRef]) => {
          const upstreamMarker: Channel<
            R,
            never,
            Chunk<In>,
            unknown,
            never,
            Chunk<In>,
            unknown
          > = Channel.readWith(
            (chunk: Chunk<In>) => Channel.write(chunk).flatMap(() => upstreamMarker),
            (err) => Channel.fail(err),
            (x) => Channel.fromEffect(upstreamDoneRef.set(true)).as(x)
          )
          return (
            (upstreamMarker >> Channel.bufferChunk<In, never, unknown>(leftoversRef)) >>
            loop(self, leftoversRef, upstreamDoneRef, z, p, f)
          )
        }
      )
    )
  }
}

function loop<R, E, In, L extends In, Z, S>(
  self: Sink<R, E, In, L, Z>,
  leftoversRef: Ref<Chunk<In>>,
  upstreamDoneRef: Ref<boolean>,
  currentResult: S,
  p: Predicate<Z>,
  f: (s: S, z: Z) => S
): Channel<R, never, Chunk<In>, unknown, E, Chunk<L>, S> {
  concreteSink(self)
  return self.channel.doneCollect.foldChannel(
    (err) => Channel.fail(err),
    ([leftovers, doneValue]) =>
      p(doneValue)
        ? Channel.fromEffect(leftoversRef.set(leftovers.flatten)).flatMap(() =>
          Channel.fromEffect(upstreamDoneRef.get).flatMap((upstreamDone) => {
            const accumulatedResult = f(currentResult, doneValue)
            return upstreamDone
              ? Channel.write(leftovers.flatten).as(accumulatedResult)
              : loop(self, leftoversRef, upstreamDoneRef, accumulatedResult, p, f)
          })
        )
        : Channel.write(leftovers.flatten).as(currentResult)
  )
}
