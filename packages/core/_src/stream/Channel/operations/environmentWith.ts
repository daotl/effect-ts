/**
 * Accesses the environment of the channel.
 *
 * @tsplus static effect/core/stream/Channel.Ops environmentWith
 */
export function environmentWith<R, OutDone>(
  f: (env: Env<R>) => OutDone
): Channel<R, unknown, unknown, unknown, never, never, OutDone> {
  return Channel.environment<R>().map(f)
}
