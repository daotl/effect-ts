/**
 * Zips this stream that is sorted by distinct keys and the specified stream
 * that is sorted by distinct keys to produce a new stream that is sorted by
 * distinct keys. Combines values associated with each key into a tuple,
 * using the specified values `defaultLeft` and `defaultRight` to fill in
 * missing values.
 *
 * This allows zipping potentially unbounded streams of data by key in
 * constant space but the caller is responsible for ensuring that the
 * streams are sorted by distinct keys.
 *
 * @tsplus static effect/core/stream/SortedByKey.Aspects zipAllSortedByKey
 * @tsplus pipeable effect/core/stream/SortedByKey zipAllSortedByKey
 * @tsplus static effect/core/stream/Stream.Aspects zipAllSortedByKey
 * @tsplus pipeable effect/core/stream/Stream zipAllSortedByKey
 */
export function zipAllSortedByKey<K, R2, E2, A, A2>(
  ord: Ord<K>,
  that: SortedByKey<R2, E2, K, A2>,
  defaultLeft: A,
  defaultRight: A2
) {
  return <R, E>(
    self: SortedByKey<R, E, K, A>
  ): Stream<R | R2, E | E2, readonly [K, readonly [A, A2]]> =>
    self.zipAllSortedByKeyWith(
      ord,
      that,
      (a) => [a, defaultRight] as const,
      (b) => [defaultLeft, b] as const,
      (a, b) => [a, b] as const
    )
}
