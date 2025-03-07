/**
 * Recovers from specified error.
 *
 * @tsplus static effect/core/io/Effect.Aspects catch
 * @tsplus pipeable effect/core/io/Effect catch
 */
export function _catch<N extends keyof E, K extends E[N] & string, E, R1, E1, A1>(
  tag: N,
  k: K,
  f: (e: Extract<E, { [n in N]: K }>) => Effect<R1, E1, A1>
) {
  return <R, A>(self: Effect<R, E, A>): Effect<R | R1, Exclude<E, { [n in N]: K }> | E1, A | A1> =>
    self.catchAll((e) => {
      if (tag in e && e[tag] === k) {
        return f(e as any)
      }
      return Effect.fail(e as any)
    })
}

export { _catch as catch }
