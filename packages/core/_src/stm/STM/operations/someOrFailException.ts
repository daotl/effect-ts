/**
 * Extracts the optional value, or fails with a `NoSuchElement` exception.
 *
 * @tsplus getter effect/core/stm/STM someOrFailException
 */
export function someOrFailException<R, E, A>(
  self: STM<R, E, Maybe<A>>
): STM<R, E | NoSuchElement, A> {
  return self.someOrFail(new NoSuchElement())
}
