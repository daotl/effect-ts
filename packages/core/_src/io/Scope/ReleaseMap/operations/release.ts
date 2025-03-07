import { Running } from "@effect/core/io/Scope/ReleaseMap/_internal/State"

/**
 * Runs the specified finalizer and removes it from the finalizers associated
 * with this scope.
 *
 * @tsplus static effect/core/io/ReleaseMap.Aspects release
 * @tsplus pipeable effect/core/io/ReleaseMap release
 */
export function release(key: number, exit: Exit<any, any>) {
  return (self: ReleaseMap): Effect<never, never, any> =>
    self.ref
      .modify((s) => {
        switch (s._tag) {
          case "Exited": {
            return [Effect.unit, s] as const
          }
          case "Running": {
            const finalizers = s.finalizers()
            const finalizer = Maybe.fromNullable(finalizers.get(key))
            finalizers.delete(key)
            return [
              finalizer.fold(
                () => Effect.unit,
                (fin) => s.update(fin)(exit)
              ),
              new Running(s.nextKey, finalizers, s.update)
            ] as const
          }
        }
      })
      .flatten
}
