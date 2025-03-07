/**
 * Publishes all of the specified messages to the hub, returning whether they
 * were published to the hub.
 *
 * @tsplus static effect/core/stm/THub.Aspects publishAll
 * @tsplus pipeable effect/core/stm/THub publishAll
 */
export function publishAll<A>(as: Collection<A>) {
  return (self: THub<A>): STM<never, never, boolean> =>
    STM.forEach(
      as,
      (_) => self.publish(_)
    ).map((_) => _.forAll(identity))
}
