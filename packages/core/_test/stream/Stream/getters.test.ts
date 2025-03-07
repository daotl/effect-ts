describe.concurrent("Stream", () => {
  describe.concurrent("right", () => {
    it("simple example", async () => {
      const program = (
        Stream.sync(Either.right(1)) + Stream.sync(Either.left(0))
      ).right
        .runCollect
        .either

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == Either.left(Maybe.none))
    })
  })

  describe.concurrent("rightOrFail", () => {
    it("simple example", async () => {
      const program = (Stream.sync(Either.right(1)) + Stream.sync(Either.left(0)))
        .rightOrFail(-1)
        .runCollect
        .either

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == Either.left(-1))
    })
  })

  describe.concurrent("some", () => {
    it("simple example", async () => {
      const program = (
        Stream.sync(Maybe.some(1)) + Stream.sync(Maybe.none)
      ).some
        .runCollect
        .either

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == Either.left(Maybe.none))
    })
  })

  describe.concurrent("someOrElse", () => {
    it("simple example", async () => {
      const program = (Stream.sync(Maybe.some(1)) + Stream.sync(Maybe.none))
        .someOrElse(-1)
        .runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == Chunk(1, -1))
    })
  })

  describe.concurrent("someOrFail", () => {
    it("simple example", async () => {
      const program = (Stream.sync(Maybe.some(1)) + Stream.sync(Maybe.none))
        .someOrFail(-1)
        .runCollect
        .either

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == Either.left(-1))
    })
  })
})
