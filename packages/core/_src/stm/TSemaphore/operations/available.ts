import { concreteTSemaphore } from "@effect/core/stm/TSemaphore/operations/_internal/TSemaphoreInternal"

/**
 * Returns the number of available permits in a transactional context.
 *
 * @tsplus getter effect/core/stm/TSemaphore available
 */
export function available(self: TSemaphore): STM<never, never, number> {
  concreteTSemaphore(self)
  return self.permits.get
}
