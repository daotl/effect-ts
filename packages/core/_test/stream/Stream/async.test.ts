describe.concurrent("Stream", () => {
  describe.concurrent("async", () => {
    it("async", async () => {
      const chunk = Chunk(1, 2, 3, 4, 5)
      const program = Stream.async<never, never, number>((emit) => {
        chunk.forEach((n) => {
          emit(Effect.sync(Chunk.single(n)))
        })
      })
        .take(chunk.size)
        .runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == chunk)
    })
  })

  describe.concurrent("asyncMaybe", () => {
    it("signal end stream", async () => {
      const program = Stream.asyncMaybe<never, never, number>((emit) => {
        emit(Effect.failSync(Maybe.none))
        return Maybe.none
      }).runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result.isEmpty)
    })

    it("Some", async () => {
      const chunk = Chunk(1, 2, 3, 4, 5)
      const program =
        Stream.asyncMaybe<never, never, number>(() => Maybe.some(Stream.fromChunk(chunk)))
          .runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == chunk)
    })

    it("None", async () => {
      const chunk = Chunk(1, 2, 3, 4, 5)
      const program = Stream.asyncMaybe<never, never, number>((emit) => {
        chunk.forEach((n) => {
          emit(Effect.sync(Chunk.single(n)))
        })
        return Maybe.none
      })
        .take(chunk.size)
        .runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == chunk)
    })

    // TODO(Mike/Max): determine implementation
    // it("back pressure", async () => {
    //   const program = Effect.Do()
    //     .bind("refCount", () => Ref.make(0))
    //     .bind("refDone", () => Ref.make(false))
    //     .bindValue("stream", ({ refCount, refDone }) =>
    //       Stream.asyncMaybe<unknown, never, number>((emit) => {
    //         setTimeout(() => {
    //           Chunk.range(0, 7).forEach((n) => {
    //             emit(refCount.set(n) > Effect.sync(Chunk.single(1)))
    //           })
    //           emit(refDone.set(true) > Effect.failSync(Maybe.none))
    //         })
    //         return Maybe.none
    //       }, 5)
    //     )
    //     .bind("run", ({ stream }) => stream.run(Sink.take(1) > Sink.never).fork)
    //     .tap(({ refCount }) =>
    //       refCount.get.repeat(Schedule.recurWhile((n) => n !== 7))
    //     )
    //     .bind("isDone", ({ refDone }) => refDone.get)
    //     .tap(({ run }) => run.interrupt())

    //   const { isDone } = await program.unsafeRunPromise()

    //   expect(isDone).toBe(false)
    // })
  })

  describe.concurrent("asyncEffect", () => {
    it("simple example", async () => {
      const chunk = Chunk(1, 2, 3, 4, 5)
      const program = Effect.Do()
        .bind("latch", () => Deferred.make<never, void>())
        .bind("fiber", ({ latch }) =>
          Stream.asyncEffect<never, unknown, unknown, void>((emit) => {
            chunk.forEach((n) => {
              emit(Effect.sync(Chunk.single(n)))
            })
            return latch.succeed(undefined) > Effect.unit
          })
            .take(chunk.size)
            .runCollect
            .fork)
        .tap(({ latch }) => latch.await)
        .flatMap(({ fiber }) => fiber.join)

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == chunk)
    })

    it("signal end stream", async () => {
      const program = Stream.asyncEffect<never, never, number, void>((emit) => {
        emit(Effect.failSync(Maybe.none))
        return Effect.unit
      }).runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result.isEmpty)
    })

    // TODO(Mike/Max): determine implementation
    // it("back pressure", async () => {
    //   const deferred = Deferred.unsafeMake<never, void>(FiberId.none)
    //   const program = Effect.Do()
    //     .bind("refCount", () => Ref.make(0))
    //     .bind("refDone", () => Ref.make(false))
    //     .bindValue("stream", ({ refCount, refDone }) =>
    //       Stream.asyncEffect<never, never, number, void>((emit) => {
    //         const t1 = setTimeout(() => {
    //           Chunk.range(0, 7).forEach((n) => {
    //             emit(refCount.set(n) > Effect.sync(Chunk.single(1)))
    //           })
    //         }, 10)
    //         const t2 = setTimeout(() => {
    //           emit(refDone.set(true) > Effect.failSync(Maybe.none))
    //         }, 100)
    //         return Effect.sync(() => {
    //           clearTimeout(t1)
    //           clearTimeout(t2)
    //         })
    //       }, 5)
    //     )
    //     .bind("run", ({ stream }) =>
    //       stream.run(Sink.take(1) > Sink.fromEffect(deferred)).fork
    //     )
    //     .tap(({ refCount }) => refCount.get.repeat(Schedule.recurWhile((n) => n !== 7)))
    //     .bind("isDone", ({ refDone }) => refDone.get)
    //     .tap(({ run }) => run.interrupt())

    //   const { isDone } = await program.unsafeRunPromise()
    //   await deferred.succeed(undefined).unsafeRunPromise()

    //   expect(isDone).toBe(false)
    // })
  })

  describe.concurrent("asyncManaged", () => {
    it("asyncManaged", async () => {
      const chunk = Chunk(1, 2, 3, 4, 5)
      const program = Effect.Do()
        .bind("latch", () => Deferred.make<never, void>())
        .bind("fiber", ({ latch }) =>
          Stream.asyncScoped<never, never, number>((cb) => {
            chunk.forEach((n) => {
              cb(Effect.sync(Chunk.single(n)))
            })
            return latch.succeed(undefined) > Effect.unit
          })
            .take(chunk.size)
            .run(Sink.collectAll<number>())
            .fork)
        .tap(({ latch }) => latch.await)
        .flatMap(({ fiber }) => fiber.join)

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == chunk)
    })

    it("asyncManaged signal end stream", async () => {
      const program = Stream.asyncScoped<never, never, number>((cb) => {
        cb(Effect.failSync(Maybe.none))
        return Effect.unit
      }).runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result.isEmpty)
    })

    // TODO(Mike/Max): determine implementation
    // it("asyncManaged back pressure", async () => {
    //   for {
    //     refCnt  <- Ref.make(0)
    //     refDone <- Ref.make[Boolean](false)
    //     stream = ZStream.asyncManaged[Any, Throwable, Int](
    //                cb => {
    //                  Future
    //                    .sequence(
    //                      (1 to 7).map(i => cb(refCnt.set(i) *> ZIO.succeedNow(Chunk.single(1))))
    //                    )
    //                    .flatMap(_ => cb(refDone.set(true) *> ZIO.fail(None)))
    //                  UIO.unit.toManaged
    //                },
    //                5
    //              )
    //     run    <- stream.run(ZSink.take(1) *> ZSink.never).fork
    //     _      <- refCnt.get.repeatWhile(_ != 7)
    //     isDone <- refDone.get
    //     _      <- run.interrupt
    //   } yield assert(isDone)(isFalse)
    // })
  })

  describe.concurrent("asyncInterrupt", () => {
    it("Left", async () => {
      const program = Effect.Do()
        .bind("cancelled", () => Ref.make(false))
        .bind("latch", () => Deferred.make<never, void>())
        .bind(
          "fiber",
          ({ cancelled, latch }) =>
            Stream.asyncInterrupt<never, never, void>((emit) => {
              emit.chunk(Chunk.single(undefined))
              return Either.left(cancelled.set(true))
            })
              .tap(() => latch.succeed(undefined))
              .runDrain
              .fork
        )
        .tap(({ latch }) => latch.await)
        .tap(({ fiber }) => fiber.interrupt)
        .flatMap(({ cancelled }) => cancelled.get)

      const result = await program.unsafeRunPromise()

      assert.isTrue(result)
    })

    it("Right", async () => {
      const chunk = Chunk(1, 2, 3, 4, 5)
      const program =
        Stream.asyncInterrupt<never, never, number>(() => Either.right(Stream.fromChunk(chunk)))
          .runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result == chunk)
    })

    it("signal end stream", async () => {
      const program = Stream.asyncInterrupt<never, never, number>((emit) => {
        emit.end()
        return Either.left(Effect.succeed(undefined))
      }).runCollect

      const result = await program.unsafeRunPromise()

      assert.isTrue(result.isEmpty)
    })

    // TODO(Mike/Max): determine implementation
    // it("asyncInterrupt back pressure", async () => {
    //   for {
    //     selfId  <- ZIO.fiberId
    //     refCnt  <- Ref.make(0)
    //     refDone <- Ref.make[Boolean](false)
    //     stream = ZStream.asyncInterrupt[Any, Throwable, Int](
    //                cb => {
    //                  Future
    //                    .sequence(
    //                      (1 to 7).map(i => cb(refCnt.set(i) *> ZIO.succeedNow(Chunk.single(1))))
    //                    )
    //                    .flatMap(_ => cb(refDone.set(true) *> ZIO.fail(None)))
    //                  Left(UIO.unit)
    //                },
    //                5
    //              )
    //     run    <- stream.run(ZSink.take(1) *> ZSink.never).fork
    //     _      <- refCnt.get.repeatWhile(_ != 7)
    //     isDone <- refDone.get
    //     exit   <- run.interrupt
    //   } yield assert(isDone)(isFalse) &&
    //     assert(exit)(failsCause(containsCause(Cause.interrupt(selfId))))
    // })
  })
})
