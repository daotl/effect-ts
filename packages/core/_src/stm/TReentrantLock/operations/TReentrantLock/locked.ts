/**
 * Determines if any fiber has a read or write lock.
 *
 * @tsplus getter effect/core/stm/TReentrantLock locked
 */
export function locked(self: TReentrantLock): USTM<boolean> {
  return self.readLocked.zipWith(self.writeLocked, (read, write) => read || write)
}
