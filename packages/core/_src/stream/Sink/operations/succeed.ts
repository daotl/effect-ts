import { SinkInternal } from "@effect/core/stream/Sink/operations/_internal/SinkInternal"

/**
 * A sink that immediately ends with the specified value.
 *
 * @tsplus static effect/core/stream/Sink.Ops succeed
 */
export function succeed<Z>(z: Z): Sink<never, never, unknown, never, Z> {
  return new SinkInternal(Channel.succeed(z))
}
