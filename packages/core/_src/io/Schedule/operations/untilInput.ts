/**
 * Returns a new schedule that continues until the specified predicate on the
 * input evaluates to true.
 *
 * @tsplus static effect/core/io/Schedule.Aspects untilInput
 * @tsplus pipeable effect/core/io/Schedule untilInput
 */
export function untilInput<In>(f: Predicate<In>) {
  return <State, Env, Out>(
    self: Schedule<State, Env, In, Out>
  ): Schedule<State, Env, In, Out> => self.check((input, _) => !f(input))
}
