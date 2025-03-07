/**
 * Runs both sinks in parallel on the input, , returning the result or the
 * error from the one that finishes first.
 *
 * @tsplus static effect/core/stream/Sink.Aspects race
 * @tsplus pipeable effect/core/stream/Sink race
 */
export function race<R1, E1, In1, L1, Z1>(that: Sink<R1, E1, In1, L1, Z1>) {
  return <R, E, In, L, Z>(
    self: Sink<R, E, In, L, Z>
  ): Sink<R | R1, E | E1, In & In1, L | L1, Z | Z1> =>
    self.raceBoth(that).map((either) => either.merge)
}
