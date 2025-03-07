import type { Driver } from "@effect/core/io/Schedule/Driver"
import {
  concreteStream,
  StreamInternal
} from "@effect/core/stream/Stream/operations/_internal/StreamInternal"

/**
 * Schedules the output of the stream using the provided `schedule` and emits
 * its output at the end (if `schedule` is finite). Uses the provided function
 * to align the stream and schedule outputs on the same type.
 *
 * @tsplus static effect/core/stream/Stream.Aspects scheduleWith
 * @tsplus pipeable effect/core/stream/Stream scheduleWith
 */
export function scheduleWith<S, R2, A, B, C>(
  schedule: Schedule<S, R2, A, B>,
  f: (a: A) => C,
  g: (b: B) => C
) {
  return <R, E>(self: Stream<R, E, A>): Stream<R | R2, E, C> => {
    concreteStream(self)
    return new StreamInternal(
      Channel.fromEffect(schedule.driver).flatMap(
        (driver) => self.channel >> loop<R, R2, E, A, B, C>(driver, Chunk.empty<A>(), f, g, 0)
      )
    )
  }
}

function loop<R, R2, E, A, B, C>(
  driver: Driver<unknown, R2, A, B>,
  chunk: Chunk<A>,
  f: (a: A) => C,
  g: (b: B) => C,
  index: number
): Channel<R | R2, E, Chunk<A>, unknown, E, Chunk<C>, unknown> {
  if (index < chunk.length) {
    const a = chunk.unsafeGet(index)
    const channel = driver.next(a).foldEffect(
      () =>
        driver.last
          .orDie
          .map(
            (b) =>
              Channel.write(Chunk(f(a), g(b))).flatMap(() =>
                loop<R, R2, E, A, B, C>(driver, chunk, f, g, index + 1)
              )
          ) < driver.reset,
      () =>
        Effect.succeed(
          Channel.write(Chunk(f(a))).flatMap(() =>
            loop<R, R2, E, A, B, C>(driver, chunk, f, g, index + 1)
          )
        )
    )
    return Channel.unwrap(channel)
  }
  return Channel.readWithCause(
    (chunk: Chunk<A>) => loop(driver, chunk, f, g, 0),
    (cause) => Channel.failCause(cause),
    Channel.succeed
  )
}
