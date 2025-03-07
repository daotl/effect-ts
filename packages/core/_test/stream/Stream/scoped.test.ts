describe.concurrent("Stream", () => {
  describe.concurrent("managed", () => {
    it("preserves failure of effect", async () => {
      const program = Stream.scoped(Effect.failSync("error")).runCollect.either

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == Either.left("error"))
    })

    it("preserves interruptibility of effect", async () => {
      const program = Effect.struct({
        interruptible: Stream.scoped(
          Effect.suspendSucceed(Effect.checkInterruptible(Effect.succeed))
        ).runHead,
        uninterruptible: Stream.scoped(
          Effect.checkInterruptible(Effect.succeed).uninterruptible
        ).runHead
      })

      const { interruptible, uninterruptible } = await program.unsafeRunPromise()

      assert.isTrue(interruptible == Maybe.some(InterruptStatus.Interruptible))
      assert.isTrue(uninterruptible == Maybe.some(InterruptStatus.Uninterruptible))
    })
  })
})
