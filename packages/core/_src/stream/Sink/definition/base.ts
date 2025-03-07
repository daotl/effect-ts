import type { _E, _In, _L, _R, _Z } from "@effect/core/stream/Sink/definition/symbols"

export const SinkSym = Symbol.for("@effect/core/stream/Sink")
export type SinkSym = typeof SinkSym

/**
 * @tsplus type effect/core/stream/Sink
 */
export interface Sink<R, E, In, L, Z> {
  readonly [SinkSym]: SinkSym
  readonly [_R]: () => R
  readonly [_E]: () => E
  readonly [_In]: (_: In) => void
  readonly [_L]: () => L
  readonly [_Z]: () => Z
}

/**
 * @tsplus type effect/core/stream/Sink.Ops
 */
export interface SinkOps {
  $: SinkAspects
}
export const Sink: SinkOps = {
  $: {}
}

/**
 * @tsplus type effect/core/stream/Sink.Aspects
 */
export interface SinkAspects {}
