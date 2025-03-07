/**
 * Creates a stream from an effect producing a value of type `Collection<A>`
 *
 * @tsplus static effect/core/stream/Stream.Ops fromCollectionEffect
 */
export function fromCollectionEffect<R, E, A>(
  collection: Effect<R, E, Collection<A>>
): Stream<R, E, A> {
  return Stream.fromEffect(collection).mapConcat(identity)
}
