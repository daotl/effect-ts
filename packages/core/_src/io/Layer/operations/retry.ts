import { DurationInternal } from "@tsplus/stdlib/data/Duration"

/**
 * Retries constructing this layer according to the specified schedule.
 *
 * @tsplus static effect/core/io/Layer.Aspects retry
 * @tsplus pipeable effect/core/io/Layer retry
 */
export function retry<S, RIn1, E, X>(schedule: Schedule<S, RIn1, E, X>) {
  return <RIn, ROut>(self: Layer<RIn, E, ROut>): Layer<RIn | RIn1, E, ROut> =>
    Layer.suspend(() => {
      const stateTag = Tag<UpdateState<S>>()
      return Layer.succeed(stateTag)({ state: schedule.initial })
        .flatMap((env) => loop(self, schedule, stateTag, env.get(stateTag).state))
    })
}

function loop<S, RIn, E, ROut, RIn1, X>(
  self: Layer<RIn, E, ROut>,
  schedule: Schedule<S, RIn1, E, X>,
  stateTag: Tag<UpdateState<S>>,
  s: S
): Layer<RIn | RIn1, E, ROut> {
  return self.catchAll((e) =>
    update(schedule, stateTag, e, s).flatMap((env) =>
      loop(self, schedule, stateTag, env.get(stateTag).state).fresh
    )
  )
}

interface UpdateState<S> {
  readonly state: S
}

function update<S, RIn, E, X>(
  schedule: Schedule<S, RIn, E, X>,
  stateTag: Tag<UpdateState<S>>,
  e: E,
  s: S
): Layer<RIn, E, UpdateState<S>> {
  return Layer.fromEffect(stateTag)(
    Clock.currentTime.flatMap((now) =>
      schedule.step(now, e, s).flatMap(([state, _, decision]) =>
        decision._tag === "Done"
          ? Effect.fail(e)
          : Clock.sleep(new DurationInternal(decision.intervals.start - now)).as({ state })
      )
    )
  )
}
