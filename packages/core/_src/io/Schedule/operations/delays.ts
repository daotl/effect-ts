import type { Decision } from "@effect/core/io/Schedule/Decision"
import { makeWithState } from "@effect/core/io/Schedule/operations/_internal/makeWithState"
import { DurationInternal } from "@tsplus/stdlib/data/Duration"

/**
 * Returns a new schedule that outputs the delay between each occurence.
 *
 * @tsplus getter effect/core/io/Schedule delays
 */
export function delays<State, Env, In, Out>(
  self: Schedule<State, Env, In, Out>
): Schedule<State, Env, In, Duration> {
  return makeWithState(self.initial, (now, input, state) =>
    self
      .step(now, input, state)
      .flatMap((
        [state, _, decision]
      ): Effect<never, never, readonly [State, Duration, Decision]> => {
        switch (decision._tag) {
          case "Done": {
            return Effect.succeed([state, (0).millis, decision] as const)
          }
          case "Continue": {
            return Effect.succeed(
              [
                state,
                new DurationInternal(decision.intervals.start - now),
                decision
              ] as const
            )
          }
        }
      }))
}
