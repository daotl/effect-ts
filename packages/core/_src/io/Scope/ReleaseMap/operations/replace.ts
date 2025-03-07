import { Exited, Running } from "@effect/core/io/Scope/ReleaseMap/_internal/State"

/**
 * Replaces the finalizer associated with this key and returns it. If the
 * finalizers associated with this scope have already been run this
 * finalizer will be run immediately.
 *
 * @tsplus static effect/core/io/ReleaseMap.Aspects replace
 * @tsplus pipeable effect/core/io/ReleaseMap replace
 */
export function replace(key: number, finalizer: Scope.Finalizer) {
  return (self: ReleaseMap): Effect<never, never, Maybe<Scope.Finalizer>> =>
    self.ref
      .modify((s) => {
        switch (s._tag) {
          case "Exited": {
            return [
              finalizer(s.exit).map(() => Maybe.none),
              new Exited(s.nextKey, s.exit, s.update)
            ] as const
          }
          case "Running": {
            const finalizers = s.finalizers()
            const oldFinalizer = Maybe.fromNullable(finalizers.get(key))
            const newFinalizers = finalizers.set(key, finalizer)
            return [
              Effect.succeed(oldFinalizer),
              new Running(s.nextKey, newFinalizers, s.update)
            ] as const
          }
        }
      })
      .flatten
}
