/**
 * Returns an effect that swaps the error/success cases. This allows you to
 * use all methods on the error channel, possibly before flipping back.
 *
 * @tsplus getter effect/core/stm/STM flip
 */
export function flip<R, E, A>(self: STM<R, E, A>): STM<R, A, E> {
  return self.foldSTM(STM.succeed, STM.fail)
}
