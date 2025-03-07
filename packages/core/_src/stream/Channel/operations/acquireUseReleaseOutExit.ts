import { BracketOut } from "@effect/core/stream/Channel/definition/primitives"

/**
 * @tsplus static effect/core/stream/Channel.Ops acquireUseReleaseOutExit
 */
export function acquireUseReleaseOutExit_<R, R2, E, Z>(
  self: Effect<R, E, Z>,
  release: (z: Z, e: Exit<unknown, unknown>) => Effect<R2, never, unknown>
): Channel<R | R2, unknown, unknown, unknown, E, Z, void> {
  return new BracketOut<R | R2, E, Z, void>(() => self, release)
}
