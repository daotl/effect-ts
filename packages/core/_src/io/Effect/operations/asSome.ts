/**
 * Maps the success value of this effect to an optional value.
 *
 * @tsplus getter effect/core/io/Effect asSome
 */
export function asSome<R, E, A>(self: Effect<R, E, A>): Effect<R, E, Maybe<A>> {
  return self.map(Maybe.some)
}
