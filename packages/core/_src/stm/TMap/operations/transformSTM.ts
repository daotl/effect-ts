import { concreteTArray } from "@effect/core/stm/TArray/operations/_internal/InternalTArray"
import { concreteTMap } from "@effect/core/stm/TMap/operations/_internal/InternalTMap"

/**
 * Atomically updates all bindings using a transactional function.
 *
 * @tsplus static effect/core/stm/TMap.Aspects transformSTM
 * @tsplus pipeable effect/core/stm/TMap transformSTM
 */
export function transformSTM<K, V, R, E>(
  f: (kv: Tuple<[K, V]>) => STM<R, E, Tuple<[K, V]>>
) {
  return (self: TMap<K, V>): STM<R, E, void> => {
    concreteTMap(self)
    return self.toChunk.flatMap((data) => STM.forEach(data, f)).flatMap((newData) =>
      STM.Effect((journal) => {
        const buckets = self.tBuckets.unsafeGet(journal)

        concreteTArray(buckets)

        const capacity = buckets.chunk.length
        const newBuckets: Array<List<Tuple<[K, V]>>> = Array.from(
          { length: capacity },
          () => List.nil()
        )
        let newSize = 0

        for (const newPair of newData) {
          const idx = TMap.indexOf(newPair.get(0), capacity)
          const newBucket = newBuckets[idx]!

          if (!newBucket.exists((_) => Equals.equals(_.get(0), newPair.get(0)))) {
            newBuckets[idx] = newBucket.prepend(newPair)
            newSize += 1
          }
        }

        let i = 0

        while (i < capacity) {
          buckets.chunk.unsafeGet(i)!.unsafeSet(newBuckets[i]!, journal)
          i += 1
        }

        self.tSize.unsafeSet(newSize, journal)
      })
    )
  }
}
