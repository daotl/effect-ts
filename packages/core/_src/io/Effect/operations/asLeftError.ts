/**
 * Maps the error value of this effect to a left value.
 *
 * @tsplus getter effect/core/io/Effect asLeftError
 */
export function asLeftError<R, E, A>(self: Effect<R, E, A>): Effect<R, Either<E, never>, A> {
  return self.mapError(Either.left)
}
