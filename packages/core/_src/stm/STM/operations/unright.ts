/**
 * Converts a `STM<R, Either<B, E>, A>` into a `STM<R, E, Either<B, A>>`.
 * The inverse of `right`.
 *
 * @tsplus getter effect/core/stm/STM unright
 */
export function unright<R, B, E, A>(
  self: STM<R, Either<B, E>, A>
): STM<R, E, Either<B, A>> {
  return self.foldSTM(
    (either) => either.fold((b) => STM.succeed(Either.left(b)), STM.fail),
    (a) => STM.succeed(Either.right(a))
  )
}
