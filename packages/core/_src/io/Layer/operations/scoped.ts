/**
 * Constructs a layer from the specified scoped effect.
 *
 * @tsplus static effect/core/io/Layer.Ops scoped
 */
export function scoped<T, R, E, T1 extends T>(
  tag: Tag<T>,
  effect: Effect<R, E, T1>
): Layer<Exclude<R, Scope>, E, T> {
  return Layer.scopedEnvironment(effect.map((service) => Env(tag, service)))
}
