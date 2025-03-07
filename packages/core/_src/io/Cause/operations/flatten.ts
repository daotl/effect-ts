/**
 * Flattens a nested cause.
 *
 * @tsplus getter effect/core/io/Cause flatten
 */
export function flatten<E>(self: Cause<Cause<E>>): Cause<E> {
  return self.flatMap(identity)
}
