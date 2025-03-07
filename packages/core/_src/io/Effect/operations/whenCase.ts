/**
 * Runs an effect when the supplied partial function matches for the given
 * value, otherwise does nothing.
 *
 * @tsplus static effect/core/io/Effect.Ops whenCase
 */
export function whenCase<R, E, A, B>(
  a: LazyArg<A>,
  pf: (a: A) => Maybe<Effect<R, E, B>>
): Effect<R, E, Maybe<B>> {
  return Effect.sync(a).flatMap((a) => pf(a).map((effect) => effect.asSome).getOrElse(Effect.none))
}
