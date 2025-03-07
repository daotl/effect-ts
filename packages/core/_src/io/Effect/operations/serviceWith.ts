/**
 * Accesses the specified service in the environment of the effect.
 *
 * Especially useful for creating "accessor" methods on services' companion
 * objects.
 *
 * @tsplus static effect/core/io/Effect.Ops serviceWith
 */
export function serviceWith<T, A>(tag: Tag<T>, f: (a: T) => A): Effect<T, never, A> {
  return Effect.serviceWithEffect(tag, (a) => Effect.sync(f(a)))
}
