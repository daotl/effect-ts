import type * as T from "../_internal/effect"
import { pipe } from "../../Function"
import * as Sink from "../Sink"
import type { Stream } from "./definitions"
import { run } from "./run"

/**
 * Consumes all elements of the stream, passing them to the specified callback.
 */
export const foreach = <A, S1, R1, E1>(f: (i: A) => T.Effect<S1, R1, E1, any>) => <
  S,
  R,
  E
>(
  self: Stream<S, R, E, A>
): T.Effect<S1 | S, R & R1, E1 | E, void> => pipe(self, run(Sink.foreach(f)))
