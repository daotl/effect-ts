/**
 * Performs this transaction the specified number of times, discarding the
 * results.
 *
 * @tsplus static effect/core/stm/STM.Aspects replicateSTMDiscard
 * @tsplus pipeable effect/core/stm/STM replicateSTMDiscard
 */
export function replicateSTMDiscard(n: number) {
  return <R, E, A>(self: STM<R, E, A>): STM<R, E, void> => STM.collectAllDiscard(self.replicate(n))
}
