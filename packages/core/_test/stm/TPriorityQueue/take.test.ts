import { a, as, b, eventEq, eventOrd } from "@effect/core/test/stm/TPriorityQueue/test-utils"

describe.concurrent("TPriorityQueue", () => {
  describe.concurrent("take", () => {
    it("take", async () => {
      const program = TPriorityQueue.from(eventOrd)(as)
        .flatMap((queue) => STM.collectAll(queue.take.replicate(as.size)))
        .commit

      const result = await program.unsafeRunPromise()

      assert.isTrue(result.corresponds(as, eventEq.equals))
    })

    it("takeUpTo", async () => {
      const program = TPriorityQueue.from(eventOrd)(as)
        .flatMap((queue) =>
          STM.struct({
            left: queue.takeUpTo(1),
            right: queue.takeAll
          })
        )
        .commit

      const { left, right } = await program.unsafeRunPromise()

      assert.isTrue(left.corresponds(Chunk.single(a), eventEq.equals))
      assert.isTrue(right.corresponds(Chunk.single(b), eventEq.equals))
    })
  })
})
