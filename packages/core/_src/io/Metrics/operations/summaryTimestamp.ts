/**
 * @tsplus static effect/core/io/Metrics/Metric.Ops summaryTimestamp
 */
export function summaryTimestamp(
  name: string,
  maxAge: Duration,
  maxSize: number,
  error: number,
  quantiles: Chunk<number>
): Metric.Summary<readonly [value: number, timestamp: number]> {
  return Metric.fromMetricKey(MetricKey.Summary(name, maxAge, maxSize, error, quantiles))
}
