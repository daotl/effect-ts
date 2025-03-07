import type { Scope } from "@effect/core/io/Scope/definition"
import { ScopeSym } from "@effect/core/io/Scope/definition"

export class ScopeInternal implements Scope {
  readonly [ScopeSym]: ScopeSym = ScopeSym

  constructor(
    readonly _fork: Effect<never, never, Scope.Closeable>,
    readonly _addFinalizerExit: (finalizer: Scope.Finalizer) => Effect<never, never, void>
  ) {}
}

/**
 * @tsplus macro remove
 */
export function concreteScope(_: Scope): asserts _ is ScopeInternal {
  //
}
