import { NumberService, NumberServiceImpl } from "@effect/core/test/stream/Channel/test-utils"

describe.concurrent("Channel", () => {
  describe.concurrent("provide", () => {
    it("simple provide", async () => {
      const program = Channel.fromEffect(Effect.service(NumberService))
        .provideService(NumberService, new NumberServiceImpl(100))
        .run

      const result = await program.unsafeRunPromise()

      assert.deepEqual(result, new NumberServiceImpl(100))
    })

    it("provide.zip(provide)", async () => {
      const program = Channel.fromEffect(Effect.service(NumberService))
        .provideService(NumberService, new NumberServiceImpl(100))
        .zip(
          Channel.fromEffect(Effect.service(NumberService)).provideService(
            NumberService,
            new NumberServiceImpl(200)
          )
        )
        .run

      const result = await program.unsafeRunPromise()

      assert.isTrue(
        Equals.equals(result, [new NumberServiceImpl(100), new NumberServiceImpl(200)] as const)
      )
    })

    it("concatMap(provide).provide", async () => {
      const program = Channel.fromEffect(Effect.service(NumberService))
        .emitCollect
        .mapOut((tuple) => tuple[1])
        .concatMap((n) =>
          Channel.fromEffect(Effect.service(NumberService).map((m) => [n, m] as const))
            .provideService(NumberService, new NumberServiceImpl(200))
            .flatMap((tuple) => Channel.write(tuple))
        )
        .provideService(NumberService, new NumberServiceImpl(100))
        .runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(
        result[0] == Chunk([new NumberServiceImpl(100), new NumberServiceImpl(200)] as const)
      )
      assert.isUndefined(result[1])
    })

    it("provide is modular", async () => {
      const program = Channel.Do()
        .bind("v1", () => Channel.fromEffect(Effect.service(NumberService)))
        .bind("v2", () =>
          Channel.fromEffect(Effect.service(NumberService)).provideEnvironment(
            Env(NumberService, { n: 2 })
          ))
        .bind("v3", () => Channel.fromEffect(Effect.service(NumberService)))
        .runDrain
        .provideEnvironment(Env(NumberService, { n: 4 }))

      const { v1, v2, v3 } = await program.unsafeRunPromise()

      assert.deepEqual(v1, { n: 4 })
      assert.deepEqual(v2, { n: 2 })
      assert.deepEqual(v3, { n: 4 })
    })
  })
})
