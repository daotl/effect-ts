/**
 * @tsplus static effect/core/io/Reloadable.Ops reload
 */
export function reload<Service>(
  tag: Tag<Service>
): Effect<Reloadable<Service>, unknown, void> {
  return Effect.serviceWithEffect(tag.reloadable, (reloadable) => reloadable.reload)
}
