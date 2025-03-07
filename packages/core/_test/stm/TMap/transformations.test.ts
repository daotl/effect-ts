import { HashContainer, hasSameElements } from "@effect/core/test/stm/TMap/test-utils"

describe.concurrent("TMap", () => {
  describe.concurrent("transformations", () => {
    it("size", async () => {
      const elems = List(["a", 1] as const, ["b", 2] as const)
      const tx = Do(($) => {
        const tmap = $(TMap.fromIterable(elems))
        const size = $(tmap.size)

        return size === 2
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("toList", async () => {
      const elems = List(["a", 1] as const, ["b", 2] as const)
      const tx = Do(($) => {
        const tmap = $(TMap.fromIterable(elems))
        const list = $(tmap.toList)

        return hasSameElements(
          list,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          elems
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("toChunk", async () => {
      const elems = List(["a", 1] as const, ["b", 2] as const)
      const tx = Do(($) => {
        const tmap = $(TMap.fromIterable(elems))
        const chunk = $(tmap.toChunk)

        return hasSameElements(
          chunk.toList,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          elems
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("toMap", async () => {
      const elems = new Map<string, number>([["a", 1], ["b", 2]])
      const tx = Do(($) => {
        const tmap = $(TMap.fromIterable(Chunk.from(elems)))
        const map = $(tmap.toMap.map(Chunk.from))

        return hasSameElements(
          map,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          Chunk.from(elems)
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("merge", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make(["a", 1]))
        const a = $(tmap.merge("a", 2, (_) => _[0] + _[1]))
        const b = $(tmap.merge("b", 2, (_) => _[0] + _[1]))

        return a === 3 && b === 2
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("transform", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make(["a", 1], ["aa", 2], ["aaa", 3]))

        $(tmap.transform((kv) => [kv[0].replaceAll("a", "b"), kv[1] * 2]))

        const res = $(tmap.toList)

        return hasSameElements(
          res,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          List(["b", 2] as const, ["bb", 4] as const, ["bbb", 6] as const)
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("transform with keys with negative hash codes", async () => {
      const tx = Do(($) => {
        const tmap = $(
          TMap.make(
            [new HashContainer(-1), 1],
            [new HashContainer(-2), 2],
            [new HashContainer(-3), 3]
          )
        )

        $(tmap.transform((kv) => [new HashContainer(kv[0].i * -2), kv[1] * 2]))

        const res = $(tmap.toList)

        return hasSameElements(
          res,
          Equivalence.tuple(Equivalence(Equals.equals), Equivalence.number),
          List(
            [new HashContainer(2), 2] as const,
            [new HashContainer(4), 4] as const,
            [new HashContainer(6), 6] as const
          )
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("transform and shrink", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make<string, number>(["a", 1], ["aa", 2], ["aaa", 3]))

        $(tmap.transform((kv) => ["key", kv[1] * 2] as const))

        const res = $(tmap.toList)

        return hasSameElements(
          res,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          List(["key", 6] as const)
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("transformSTM", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make<string, number>(["a", 1], ["aa", 2], ["aaa", 3]))

        $(tmap.transformSTM((kv) => STM.succeed([kv[0].replaceAll("a", "b"), kv[1] * 2] as const)))

        const res = $(tmap.toList)

        return hasSameElements(
          res,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          List(["b", 2] as const, ["bb", 4] as const, ["bbb", 6] as const)
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("transformSTM and shrink", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make<string, number>(["a", 1], ["aa", 2], ["aaa", 3]))

        $(tmap.transformSTM((kv) => STM.succeed(["key", kv[1] * 2] as const)))

        const res = $(tmap.toList)

        return hasSameElements(
          res,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          List(["key", 6] as const)
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("transformValues", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make<string, number>(["a", 1], ["aa", 2], ["aaa", 3]))

        $(tmap.transformValues((v) => v * 2))

        const res = $(tmap.toList)

        return hasSameElements(
          res,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          List(["a", 2] as const, ["aa", 4] as const, ["aaa", 6] as const)
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("parallel value transformation", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make<string, number>(["a", 0]).commit)

        const transformation = tmap.transformValues((v) => v + 1).commit.repeatN(999)

        const n = 2

        $(Effect.collectAllParDiscard(Chunk.fill(n, () => transformation)))

        const res = $(tmap.get("a").commit)

        return res == Maybe.some(2000)
      })
      const result = await tx.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("transformValuesSTM", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make<string, number>(["a", 1], ["aa", 2], ["aaa", 3]))

        $(tmap.transformValuesSTM((v) => STM.succeed(v * 2)))

        const res = $(tmap.toList)

        return hasSameElements(
          res,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          List(["a", 2] as const, ["aa", 4] as const, ["aaa", 6] as const)
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("updateWith", async () => {
      const tx = Do(($) => {
        const tmap = $(TMap.make<string, number>(["a", 1], ["b", 2]))

        $(tmap.updateWith("a", (v) => v.map((_) => _ + 1)))
        $(tmap.updateWith("b", (v) => Maybe.none))
        $(tmap.updateWith("c", (v) => Maybe.some(3)))
        $(tmap.updateWith("d", (v) => Maybe.none))

        const res = $(tmap.toMap.map(Chunk.from))

        return hasSameElements(
          res,
          Equivalence.tuple(Equivalence.string, Equivalence.number),
          Chunk.from(new Map([["a", 2], ["c", 3]]))
        )
      })
      const result = await tx.commit.unsafeRunPromise()

      assert.isTrue(result)
    })
  })
})
