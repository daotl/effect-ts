import type { Driver } from "@effect/core/io/Schedule"

/**
 * Returns a new effect that repeats this effect according to the specified
 * schedule or until the first failure, at which point, the failure value and
 * schedule output are passed to the specified handler.
 *
 * Scheduled recurrences are in addition to the first execution, so that
 * `io.repeat(Schedule.once)` yields an effect that executes `io`, and then if
 * that succeeds, executes `io` an additional time.
 *
 * @tsplus static effect/core/io/Effect.Aspects repeatOrElseEither
 * @tsplus pipeable effect/core/io/Effect repeatOrElseEither
 */
export function repeatOrElseEither<S, R1, A, B, E, R2, E2, C>(
  schedule: Schedule<S, R1, A, B>,
  orElse: (e: E, option: Maybe<B>) => Effect<R2, E2, C>
): <R>(self: Effect<R, E, A>) => Effect<R | R1 | R2, E2, Either<C, B>> {
  return <R>(self: Effect<R, E, A>): Effect<R | R1 | R2, E2, Either<C, B>> =>
    schedule.driver.flatMap((driver) =>
      self.foldEffect(
        (e) => orElse(e, Maybe.none).map(Either.left),
        (a) => repeatOrElseEitherLoop(self, driver, orElse, a)
      )
    )
}

function repeatOrElseEitherLoop<R, E, A, R1, B, R2, E2, C>(
  self: Effect<R, E, A>,
  driver: Driver<unknown, R1, A, B>,
  orElse: (e: E, option: Maybe<B>) => Effect<R2, E2, C>,
  value: A
): Effect<R | R1 | R2, E2, Either<C, B>> {
  return driver.next(value).foldEffect(
    () => driver.last.orDie.map(Either.right),
    (b) =>
      self.foldEffect(
        (e) => orElse(e, Maybe.some(b)).map(Either.left),
        (a) => repeatOrElseEitherLoop(self, driver, orElse, a)
      )
  )
}
