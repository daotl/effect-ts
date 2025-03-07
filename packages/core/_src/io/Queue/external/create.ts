import { createQueue } from "@effect/core/io/Effect/operations/excl-forEach"
import type { Strategy } from "@effect/core/io/Queue/operations/strategy"

export { createQueue } from "@effect/core/io/Effect/operations/excl-forEach"

/**
 * Creates a new `Queue` using the provided `Strategy`.
 *
 * @tsplus static effect/core/io/Queue.Ops create
 */
export const create: <A>(
  queue: MutableQueue<A>,
  strategy: Strategy<A>
) => Effect<never, never, Queue<A>> = createQueue
