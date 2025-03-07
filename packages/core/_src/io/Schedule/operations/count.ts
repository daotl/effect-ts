/**
 * A schedule that always recurs, which counts the number of recurrences.
 *
 * @tsplus static effect/core/io/Schedule.Ops count
 */
export const count: Schedule<number, never, unknown, number> = Schedule.unfold(0, (n) => n + 1)
