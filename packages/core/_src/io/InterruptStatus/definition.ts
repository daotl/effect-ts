/**
 * The `InterruptStatus` of a fiber determines whether or not it can be
 * interrupted. The status can change over time in different regions.
 *
 * @tsplus type effect/core/io/InterruptStatus
 */
export interface InterruptStatus extends Equals {
  readonly isInterruptible: boolean
  readonly isUninterruptible: boolean
  readonly toBoolean: boolean
}

/**
 * @tsplus type effect/core/io/InterruptStatus.Ops
 */
export interface InterruptStatusOps {
  $: InterruptStatusAspects
}
export const InterruptStatus: InterruptStatusOps = {
  $: {}
}

/**
 * @tsplus type effect/core/io/InterruptStatus.Aspects
 */
export interface InterruptStatusAspects {}

export class InterruptStatusImpl implements InterruptStatus {
  constructor(readonly isInterruptible: boolean) {}

  get isUninterruptible(): boolean {
    return !this.isInterruptible
  }

  get toBoolean(): boolean {
    return this.isInterruptible
  }

  [Hash.sym](): number {
    return Hash.unknown(this.isInterruptible)
  }

  [Equals.sym](u: unknown): boolean {
    return u instanceof InterruptStatusImpl && this.isInterruptible === u.isInterruptible
  }
}

/**
 * Indicates the fiber can be interrupted right now.
 *
 * @tsplus static effect/core/io/InterruptStatus.Ops Interruptible
 */
export const Interruptible: InterruptStatus = new InterruptStatusImpl(true)

/**
 * Indicates the fiber cannot be interrupted right now.
 *
 * @tsplus static effect/core/io/InterruptStatus.Ops Uninterruptible
 */
export const Uninterruptible: InterruptStatus = new InterruptStatusImpl(false)

/**
 * @tsplus static effect/core/io/InterruptStatus.Ops fromBoolean
 */
export function fromBoolean(b: boolean): InterruptStatus {
  return b ? Interruptible : Uninterruptible
}
