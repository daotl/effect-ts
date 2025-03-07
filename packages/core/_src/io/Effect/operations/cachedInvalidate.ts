/**
 * Returns an effect that, if evaluated, will return the cached result of this
 * effect. Cached results will expire after `timeToLive` duration. In
 * addition, returns an effect that can be used to invalidate the current
 * cached value before the `timeToLive` duration expires.
 *
 * @tsplus static effect/core/io/Effect.Aspects cachedInvalidate
 * @tsplus pipeable effect/core/io/Effect cachedInvalidate
 */
export function cachedInvalidate(timeToLive: Duration) {
  return <R, E, A>(
    self: Effect<R, E, A>
  ): Effect<R, never, readonly [Effect<never, E, A>, Effect<never, never, void>]> =>
    Do(($) => {
      const environment = $(Effect.environment<R>())
      const cache = $(Ref.Synchronized.make<Maybe<readonly [number, Deferred<E, A>]>>(Maybe.none))
      return [
        get(self, timeToLive, cache).provideEnvironment(environment),
        invalidate(cache)
      ] as const
    })
}

function compute<R, E, A>(
  self: Effect<R, E, A>,
  timeToLive: Duration,
  start: number
): Effect<R, never, Maybe<readonly [number, Deferred<E, A>]>> {
  return Do(($) => {
    const deferred = $(Deferred.make<E, A>())
    $(self.intoDeferred(deferred))
    return Maybe.some([start + timeToLive.millis, deferred] as const)
  })
}

function get<R, E, A>(
  self: Effect<R, E, A>,
  timeToLive: Duration,
  cache: Ref.Synchronized<Maybe<readonly [number, Deferred<E, A>]>>
): Effect<R, E, A> {
  return Effect.uninterruptibleMask(({ restore }) =>
    Clock.currentTime.flatMap((time) =>
      cache
        .updateSomeAndGetEffect((_) =>
          _.fold(
            () => Maybe.some(compute(self, timeToLive, time)),
            ([end]) =>
              end - time <= 0
                ? Maybe.some(compute(self, timeToLive, time))
                : Maybe.none
          )
        )
        .flatMap((a) => a._tag === "None" ? Effect.dieSync("Bug") : restore(a.value[1].await))
    )
  )
}

function invalidate<E, A>(
  cache: Ref.Synchronized<Maybe<readonly [number, Deferred<E, A>]>>
): Effect<never, never, void> {
  return cache.set(Maybe.none)
}
