import {
  acquire1,
  acquire2,
  makeLayer1,
  makeLayer2,
  makeRef,
  release1,
  release2
} from "@effect/core/test/io/Layer/test-utils"

describe.concurrent("Layer", () => {
  describe.concurrent("orElse", () => {
    it("uses an alternative layer", async () => {
      const program = Effect.Do()
        .bind("ref", () => makeRef())
        .bindValue("layer1", ({ ref }) => makeLayer1(ref))
        .bindValue("layer2", ({ ref }) => makeLayer2(ref))
        .bindValue(
          "env",
          ({ layer1, layer2 }) => ((layer1 >> Layer.fail("failed!")) | layer2).build
        )
        .bind("fiber", ({ env }) => Effect.scoped(env))
        .flatMap(({ ref }) => ref.get)

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == Chunk(acquire1, release1, acquire2, release2))
    })
  })

  describe.concurrent("error handling", () => {
    it("handles errors gracefully", async () => {
      interface Bar {
        readonly bar: string
      }

      const BarTag = Tag<Bar>()

      interface Baz {
        readonly baz: string
      }

      const BazTag = Tag<Baz>()

      const ScopedTag = Tag<void>()

      const sleep = Effect.sleep((100).millis)
      const layer1 = Layer.fail("foo")
      const layer2 = Layer.succeed(BarTag)({ bar: "bar" })
      const layer3 = Layer.succeed(BazTag)({ baz: "baz" })
      const layer4 = Layer.scoped(
        ScopedTag,
        Effect.scoped(Effect.acquireRelease(sleep, () => sleep))
      )

      const program = Effect.unit
        .provideLayer(layer1 + (layer2 + layer3 > layer4))
        .exit

      const result = await program.unsafeRunPromise()

      assert.isTrue(result.isFailure())
    })
  })
})
