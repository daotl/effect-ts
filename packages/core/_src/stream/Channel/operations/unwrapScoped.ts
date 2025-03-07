/**
 * Makes a channel from a managed that returns a channel in case of success.
 *
 * @tsplus static effect/core/stream/Channel.Ops unwrapScoped
 */
export function unwrapScoped<
  R,
  E,
  Env,
  InErr,
  InElem,
  InDone,
  OutErr,
  OutElem,
  OutDone
>(
  self: Effect<
    R,
    E,
    Channel<Env, InErr, InElem, InDone, OutErr, OutElem, OutDone>
  >
): Channel<Exclude<R, Scope> | Env, InErr, InElem, InDone, E | OutErr, OutElem, OutDone> {
  return Channel.concatAllWith(
    Channel.scoped(self),
    (d, _) => d,
    (d, _) => d
  )
}
