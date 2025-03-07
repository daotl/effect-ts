/**
 * Takes a single element from the queue, returning `None` if the queue is
 * empty.
 *
 * @tsplus getter effect/core/stm/THub/TDequeue poll
 */
export function poll<A>(self: THub.TDequeue<A>): USTM<Maybe<A>> {
  return self.takeUpTo(1).map((_) => _.head)
}
