import { STMDieException, STMEffect } from "@effect/core/stm/STM/definition/primitives"

/**
 * Kills the fiber running the effect.
 *
 * @tsplus static effect/core/stm/STM.Ops die
 */
export function die(u: unknown): STM<never, never, never> {
  return new STMEffect(() => {
    throw new STMDieException(u)
  })
}
