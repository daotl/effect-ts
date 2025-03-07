import { TSemaphoreInternal } from "@effect/core/stm/TSemaphore/operations/_internal/TSemaphoreInternal"

/**
 * @tsplus static effect/core/stm/TSemaphore.Ops unsafeMake
 */
export function unsafeMake(permits: number): TSemaphore {
  return new TSemaphoreInternal(TRef.unsafeMake(permits))
}
