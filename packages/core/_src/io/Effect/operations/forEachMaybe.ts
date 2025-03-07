/**
 * Applies the function `f` if the argument is non-empty and returns the
 * results in a new `Maybe<B>`.
 *
 * @tsplus static effect/core/io/Effect.Ops forEachMaybe
 */
export function forEachMaybe<R, E, A, B>(
  maybe: Maybe<A>,
  f: (a: A) => Effect<R, E, B>
): Effect<R, E, Maybe<B>> {
  return maybe.fold(Effect.none, (a) => f(a).map(Maybe.some))
}
