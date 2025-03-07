import { concreteTArray } from "@effect/core/stm/TArray/operations/_internal/InternalTArray"

/**
 * @tsplus getter effect/core/stm/TArray length
 */
export function length<A>(self: TArray<A>): number {
  concreteTArray(self)
  return self.chunk.length
}
