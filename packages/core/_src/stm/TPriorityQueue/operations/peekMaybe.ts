import { concreteTPriorityQueue } from "@effect/core/stm/TPriorityQueue/operations/_internal/InternalTPriorityQueue"

/**
 * Peeks at the first value in the queue without removing it, returning `None`
 * if there is not a value in the queue.
 *
 * @tsplus getter effect/core/stm/TPriorityQueue peekMaybe
 */
export function peekMaybe<A>(self: TPriorityQueue<A>): USTM<Maybe<A>> {
  concreteTPriorityQueue(self)
  return self.map.modify((map) => [
    map.headMaybe.map((tuple) => tuple[1]).flatMap((chunk) => chunk.head),
    map
  ])
}
