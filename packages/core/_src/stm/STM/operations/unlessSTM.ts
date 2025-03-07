/**
 * The moral equivalent of `if (!p) exp` when `p` has side-effects.
 *
 * @tsplus static effect/core/stm/STM.Aspects unlessSTM
 * @tsplus pipeable effect/core/stm/STM unlessSTM
 */
export function unlessSTM<R2, E2>(predicate: LazyArg<STM<R2, E2, boolean>>) {
  return <R, E, A>(self: STM<R, E, A>): STM<R | R2, E | E2, Maybe<A>> =>
    STM.suspend(predicate().flatMap((b) => (b ? STM.none : self.asSome)))
}
