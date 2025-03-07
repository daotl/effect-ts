export const ExampleError = new Error("Oh noes!")
export const InterruptCause1 = new Error("Oh noes 1!")
export const InterruptCause2 = new Error("Oh noes 2!")
export const InterruptCause3 = new Error("Oh noes 3!")

export const ExampleErrorFail = Effect.failSync(ExampleError)
export const ExampleErrorDie = Effect.dieSync(() => {
  throw ExampleError
})

export interface NumberService {
  readonly n: number
}

export const NumberService = Tag<NumberService>()

export function asyncExampleError<A>(): Effect<never, unknown, A> {
  return Effect.async((cb) => {
    cb(Effect.failSync(ExampleError))
  })
}

export function asyncUnit<E>(): Effect<never, E, void> {
  return Effect.async((cb) => {
    cb(Effect.unit)
  })
}

export function exactlyOnce<R, A, A1>(
  value: A,
  f: (_: Effect<never, never, A>) => Effect<R, string, A1>
): Effect<R, string, A1> {
  return Do(($) => {
    const ref = $(Ref.make(0))
    const res = $(f(ref.update((n) => n + 1).zipRight(Effect.sync(value))))
    const count = $(ref.get)
    $(count !== 1 ? Effect.failSync("Accessed more than once") : Effect.unit)
    return res
  })
}

export function sum(n: number): number {
  if (n < 0) {
    return 0
  }
  return n + sum(n - 1)
}

export function fib(n: number): number {
  if (n <= 1) {
    return n
  }
  return fib(n - 1) + fib(n - 2)
}

export function concurrentFib(n: number): Effect<never, never, number> {
  if (n <= 1) {
    return Effect.sync(n)
  }
  return Do(($) => {
    const fiber1 = $(concurrentFib(n - 1).fork)
    const fiber2 = $(concurrentFib(n - 2).fork)
    const v1 = $(fiber1.join)
    const v2 = $(fiber2.join)
    return v1 + v2
  })
}

export function deepErrorEffect(n: number): Effect<never, unknown, void> {
  if (n === 0) {
    return Effect.attempt(() => {
      throw ExampleError
    })
  }
  return Effect.unit.zipRight(deepErrorEffect(n - 1))
}

export function deepErrorFail(n: number): Effect<never, unknown, void> {
  if (n === 0) {
    return Effect.failSync(ExampleError)
  }
  return Effect.unit.zipRight(deepErrorFail(n - 1))
}

export function deepMapEffect(n: number): Effect<never, never, number> {
  function loop(n: number, acc: Effect<never, never, number>): Effect<never, never, number> {
    if (n <= 0) {
      return acc
    }
    return Effect.suspendSucceed(
      loop(
        n - 1,
        acc.map((n) => n + 1)
      )
    )
  }
  return loop(n, Effect.sync(0))
}

/**
 * @tsplus fluent effect/core/io/Effect flackyTest
 */
export function flacky<R, E, A>(self: Effect<R, E, A>, timeout: Duration = (30).seconds) {
  return self.resurrect
    .retry((Schedule.recurs(10) >> Schedule.elapsed).whileOutput(_ => _ <= timeout))
    .orDie
}
