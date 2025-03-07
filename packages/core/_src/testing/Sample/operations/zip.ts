/**
 * Composes this sample with the specified sample to create a cartesian
 * product of values and shrinkings.
 *
 * @tsplus pipeable-operator effect/core/testing/Sample.Aspects +
 * @tsplus static effect/core/testing/Sample.Aspects zip
 * @tsplus pipeable effect/core/testing/Sample zip
 */
export function zip<R2, A2>(that: Sample<R2, A2>) {
  return <R, A>(self: Sample<R, A>): Sample<R | R2, readonly [A, A2]> =>
    self.zipWith(that, (a, b) => [a, b])
}
