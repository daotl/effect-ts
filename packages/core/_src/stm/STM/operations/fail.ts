import { STMEffect, STMFailException } from "@effect/core/stm/STM/definition/primitives"

/**
 * Returns a value that models failure in the transaction.
 *
 * @tsplus static effect/core/stm/STM.Ops fail
 */
export function fail<E>(e: E): STM<never, E, never> {
  return new STMEffect(() => {
    throw new STMFailException(e)
  })
}
