import { constFalse } from "@tsplus/stdlib/data/Function"

describe.concurrent("Stream", () => {
  describe.concurrent("find", () => {
    it("simple example", async () => {
      const p = (n: number) => n === 3
      const stream = Stream(1, 2, 3, 4, 5)
      const program = Effect.struct({
        actual: stream.find(p).runHead,
        expected: stream.runCollect.map((chunk) => chunk.find(p))
      })

      const { actual, expected } = await program.unsafeRunPromise()

      assert.isTrue(actual == expected)
    })
  })

  describe.concurrent("findEffect", () => {
    it("simple example", async () => {
      const p = (n: number) => Effect.sync(n === 3)
      const stream = Stream(1, 2, 3, 4, 5)
      const program = Effect.struct({
        actual: stream.findEffect(p).runHead,
        expected: stream.runCollect.flatMap((chunk) => Effect.find(chunk, p))
      })

      const { actual, expected } = await program.unsafeRunPromise()

      assert.isTrue(actual == expected)
    })

    it("throws correct error", async () => {
      const program = Stream(1, 2, 3, 4)
        .findEffect((n) => (n === 3 ? Effect.failSync("boom") : Effect.sync(constFalse)))
        .either
        .runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == Chunk(Either.left("boom")))
    })
  })
})
