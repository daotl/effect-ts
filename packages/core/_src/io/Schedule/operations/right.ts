/**
 * Returns a new schedule that makes this schedule available on the `Right`
 * side of an `Either` input, allowing propagating some type `X` through this
 * channel on demand.
 *
 * @tsplus getter effect/core/io/Schedule right
 */
export function right<State, Env, In, Out, X>(
  self: Schedule<State, Env, In, Out>
): Schedule<readonly [void, State], Env, Either<X, In>, Either<X, Out>> {
  return Schedule.identity<X>() + self
}
