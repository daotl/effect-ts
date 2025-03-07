/**
 * Logs the specified message at the current log level.
 *
 * @tsplus static effect/core/stream/Sink.Ops log
 */
export function log(message: string): Sink<never, never, unknown, unknown, void> {
  return Sink.fromEffect(Effect.log(message))
}

/**
 * Logs the specified message at the debug log level.
 *
 * @tsplus static effect/core/stream/Sink.Ops logDebug
 */
export function logDebug(message: string): Sink<never, never, unknown, unknown, void> {
  return Sink.fromEffect(Effect.logDebug(message))
}

/**
 * Logs the specified message at the error log level.
 *
 * @tsplus static effect/core/stream/Sink.Ops logError
 */
export function logError(message: string): Sink<never, never, unknown, unknown, void> {
  return Sink.fromEffect(Effect.logError(message))
}

/**
 * Logs the specified message at the error log level.
 *
 * @tsplus static effect/core/stream/Sink.Ops logErrorCause
 */
export function logErrorCause(cause: Cause<unknown>): Sink<never, never, unknown, unknown, void> {
  return Sink.fromEffect(Effect.logErrorCause(cause))
}

/**
 * Logs the specified message at the fatal log level.
 *
 * @tsplus static effect/core/stream/Sink.Ops logFatal
 */
export function logFatal(message: string): Sink<never, never, unknown, unknown, void> {
  return Sink.fromEffect(Effect.logFatal(message))
}

/**
 * Logs the specified message at the info log level.
 *
 * @tsplus static effect/core/stream/Sink.Ops logInfo
 */
export function logInfo(message: string): Sink<never, never, unknown, unknown, void> {
  return Sink.fromEffect(Effect.logInfo(message))
}

/**
 * Logs the specified message at the trace log level.
 *
 * @tsplus static effect/core/stream/Sink.Ops logTrace
 */
export function logTrace(message: string): Sink<never, never, unknown, unknown, void> {
  return Sink.fromEffect(Effect.logTrace(message))
}

/**
 * Logs the specified message at the warning log level.
 *
 * @tsplus static effect/core/stream/Sink.Ops logWarning
 */
export function logWarning(message: string): Sink<never, never, unknown, unknown, void> {
  return Sink.fromEffect(Effect.logWarning(message))
}

/**
 * Sets the log level for streams composed after this.
 *
 * @tsplus static effect/core/stream/Sink.Ops logLevel
 */
export function logLevel(level: LogLevel) {
  return <R, E, In, L, Z>(sink: Sink<R, E, In, L, Z>): Sink<R, E, In, L, Z> =>
    Sink.unwrapScoped(FiberRef.currentLogLevel.locallyScoped(level).as(sink))
}

/**
 * Adjusts the label for the logging span for streams composed after this.
 *
 * @tsplus static effect/core/stream/Sink.Ops logSpan
 */
export function logSpan(label: string) {
  return <R, E, In, L, Z>(sink: Sink<R, E, In, L, Z>): Sink<R, E, In, L, Z> =>
    Sink.unwrapScoped(
      FiberRef.currentLogSpan.get.flatMap((stack) => {
        const now = Date.now()
        const logSpan = LogSpan(label, now)
        return FiberRef.currentLogSpan.locallyScoped(stack.prepend(logSpan)).as(sink)
      })
    )
}

/**
 * Annotates each log in streams composed after this with the specified log
 * annotation.
 *
 * @tsplus static effect/core/stream/Sink.Ops logAnnotate
 */
export function logAnnotate(key: string, value: string) {
  return <R, E, In, L, Z>(sink: Sink<R, E, In, L, Z>): Sink<R, E, In, L, Z> =>
    Sink.unwrapScoped(
      FiberRef.currentLogAnnotations.get.flatMap((annotations) =>
        FiberRef.currentLogAnnotations.locallyScoped(annotations.set(key, value)).as(sink)
      )
    )
}

/**
 * Retrieves the log annotations associated with the current scope.
 *
 * @tsplus static effect/core/stream/Sink.Ops logAnnotations
 */
export function logAnnotations(): Sink<
  never,
  never,
  unknown,
  unknown,
  ImmutableMap<string, string>
> {
  return Sink.fromEffect(FiberRef.currentLogAnnotations.get)
}
