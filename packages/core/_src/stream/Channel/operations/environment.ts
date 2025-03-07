/**
 * Accesses the whole environment of the channel.
 *
 * @tsplus static effect/core/stream/Channel.Ops environment
 */
export function environment<R>(): Channel<R, unknown, unknown, unknown, never, never, Env<R>> {
  return Channel.fromEffect(Effect.environment<R>())
}
