import { concreteTDeferred } from "@effect/core/stm/TDeferred/operations/_internal/InternalTDeferred"

/**
 * @tsplus getter effect/core/stm/TDeferred poll
 */
export function poll<E, A>(self: TDeferred<E, A>): USTM<Maybe<Either<E, A>>> {
  concreteTDeferred(self)
  return self.ref.get
}
