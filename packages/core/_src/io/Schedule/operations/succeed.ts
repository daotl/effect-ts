/**
 * Returns a schedule that repeats one time, producing the specified constant
 * value.
 *
 * @tsplus static effect/core/io/Schedule.Ops succeed
 */
export function succeed<A>(a: A): Schedule<number, never, unknown, A> {
  return Schedule.repeatForever.map(() => a)
}
