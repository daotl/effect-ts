import { Stateful } from "@effect/core/io/Fiber/_internal/message"
import type { FiberRuntime } from "@effect/core/io/Fiber/_internal/runtime"

/**
 * A `FiberScope` represents the scope of a fiber lifetime. The scope of a
 * fiber can be retrieved using `Effect.descriptor`, and when forking fibers,
 * you can specify a custom scope to fork them on by using the `forkIn`.
 *
 * @tsplus type effect/core/io/FiberScope
 */
export type FiberScope = Global | Local

/**
 * @tsplus type effect/core/io/FiberScope.Ops
 */
export interface FiberScopeOps {}
export const FiberScope: FiberScopeOps = {}

export interface CommonScope {
  readonly fiberId: FiberId

  readonly add: (
    runtimeFlags: RuntimeFlags,
    child: FiberRuntime<any, any>
  ) => void
}

export class Global implements CommonScope {
  readonly fiberId = FiberId.none

  add(
    runtimeFlags: RuntimeFlags,
    child: FiberRuntime<any, any>
  ) {
    if (runtimeFlags.isEnabled(RuntimeFlags.FiberRoots)) {
      _roots.add(child)
      child.addObserver(() => {
        _roots.delete(child)
      })
    }
  }
}

export class Local implements CommonScope {
  constructor(readonly fiberId: FiberId, readonly parent: FiberRuntime<any, any>) {}

  add(
    _runtimeFlags: RuntimeFlags,
    child: FiberRuntime<any, any>
  ) {
    this.parent.tell(
      new Stateful((parentFiber) => {
        parentFiber.addChild(child)
        child.addObserver(() => {
          parentFiber.removeChild(child)
        })
      })
    )
  }
}

/**
 * The global scope. Anything forked onto the global scope is not supervised,
 * and will only terminate on its own accord (never from interruption of a
 * parent fiber, because there is no parent fiber).
 *
 * @tsplus static effect/core/io/FiberScope.Ops global
 */
export const globalScope = new Global()

/**
 * Unsafely creats a new `Scope` from a `Fiber`.
 *
 * @tsplus static effect/core/io/FiberScope.Ops make
 */
export function make(fiber: FiberRuntime<any, any>): FiberScope {
  return new Local(fiber.id, fiber)
}

/**
 * @tsplus static effect/core/io/FiberScope.Ops _roots
 */
export const _roots = new Set<FiberRuntime<any, any>>()
