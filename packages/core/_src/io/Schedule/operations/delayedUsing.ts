/**
 * Takes a schedule that produces a delay, and returns a new schedule that
 * uses this delay to further delay intervals in the resulting schedule.
 *
 * @tsplus static effect/core/io/Schedule.Ops delayed
 */
export function delayedUsing<State, Env, In>(
  schedule: Schedule<State, Env, In, Duration>
): Schedule<State, Env, In, Duration> {
  return schedule.addDelay((x) => x)
}
