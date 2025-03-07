/**
 * Accesses the specified service in the environment of the channel.
 *
 * @tsplus static effect/core/stream/Channel.Ops service
 */
export function service<T>(tag: Tag<T>): Channel<T, unknown, unknown, unknown, never, never, T> {
  return Channel.fromEffect(Effect.service(tag))
}
