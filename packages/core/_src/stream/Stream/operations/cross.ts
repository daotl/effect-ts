import {
  concreteStream,
  StreamInternal
} from "@effect/core/stream/Stream/operations/_internal/StreamInternal"

/**
 * Composes this stream with the specified stream to create a cartesian
 * product of elements. The `that` stream would be run multiple times, for
 * every element in the `this` stream.
 *
 * See also `Stream.zip` for the more common point-wise variant.
 *
 * @tsplus static effect/core/stream/Stream.Aspects cross
 * @tsplus pipeable effect/core/stream/Stream cross
 */
export function cross<R2, E2, A2>(that: Stream<R2, E2, A2>) {
  return <R, E, A>(self: Stream<R, E, A>): Stream<R | R2, E | E2, readonly [A, A2]> => {
    concreteStream(self)
    return new StreamInternal(
      self.channel.concatMap((a) => {
        concreteStream(that)
        return that.channel.mapOut((b) => a.flatMap((a) => b.map((b) => [a, b])))
      })
    )
  }
}
