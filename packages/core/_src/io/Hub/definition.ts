export const HubSym = Symbol.for("@effect/core/io/XHub")
export type HubSym = typeof HubSym

/**
 * A `Hub<A>` is an asynchronous message hub into which publishers can publish
 * messages of type `A` and subscribers can subscribe to take messages of type
 * `A`.
 *
 * @tsplus type effect/core/io/Hub
 */
export interface Hub<A> extends Enqueue<A> {
  readonly [HubSym]: HubSym

  /**
   * Publishes a message to the hub, returning whether the message was published
   * to the hub.
   */
  readonly publish: (a: A) => Effect<never, never, boolean>

  /**
   * Publishes all of the specified messages to the hub, returning whether they
   * were published to the hub.
   */
  readonly publishAll: (as: Collection<A>) => Effect<never, never, boolean>

  /**
   * Subscribes to receive messages from the hub. The resulting subscription can
   * be evaluated multiple times within the scope to take a message from the hub
   * each time.
   */
  readonly subscribe: Effect<Scope, never, Dequeue<A>>
}

/**
 * @tsplus type effect/core/io/Hub.Ops
 */
export interface HubOps {
  $: HubAspects
}
export const Hub: HubOps = {
  $: {}
}

/**
 * @tsplus type effect/core/io/Hub.Aspects
 */
export interface HubAspects {}
