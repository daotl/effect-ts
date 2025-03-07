/**
 * @tsplus static effect/core/io/Exit.Ops fail
 */
export function fail<E>(error: E): Exit<E, never> {
  return Exit.failCause(Cause.fail(error))
}
