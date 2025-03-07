const ExampleError = new Error("Oh noes!")

const ExampleErrorFail = Effect.failSync(ExampleError)
const ExampleErrorDie = Effect.dieSync(() => {
  throw ExampleError
})

describe.concurrent("Effect", () => {
  describe.concurrent("absorbWith", () => {
    test("on fail", () =>
      Do(($) => {
        const result = $(ExampleErrorFail.absorbWith(Maybe.some).exit)
        assert.isTrue(result == Exit.fail(Maybe.some(ExampleError)))
      }))

    test("on die", () =>
      Do(($) => {
        const result = $(ExampleErrorDie.absorbWith(() => "never").exit)
        assert.isTrue(result == Exit.fail(ExampleError))
      }))

    test("on success", () =>
      Do(($) => {
        const result = $(Effect.sync(1).absorbWith(() => ExampleError))
        assert.strictEqual(result, 1)
      }))
  })
})
