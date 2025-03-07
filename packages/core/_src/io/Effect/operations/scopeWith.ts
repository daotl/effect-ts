/**
 * Accesses the current scope and uses it to perform the specified effect.
 *
 * @tsplus static effect/core/io/Effect.Ops scopeWith
 */
export function scopeWith<R, E, A>(
  f: (scope: Scope) => Effect<R, E, A>
): Effect<R | Scope, E, A> {
  return Effect.serviceWithEffect(Scope.Tag, f)
}
