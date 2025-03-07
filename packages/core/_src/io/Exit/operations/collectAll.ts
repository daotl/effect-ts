/**
 * @tsplus static effect/core/io/Exit.Ops collectAll
 */
export function collectAll<E, A>(
  exits: Collection<Exit<E, A>>
): Maybe<Exit<E, List<A>>> {
  const head = exits[Symbol.iterator]().next()
  if (!head.done && head.value) {
    return Maybe.some(
      exits.skip(1).reduce(head.value.map((a) => List(a)), (acc, el) =>
        acc.zipWith(
          el,
          (list, a) => list.prepend(a),
          (e1, e2) => e1 + e2
        )).map((list) => list.reverse)
    )
  }
  return Maybe.none
}
