/**
 * A counter, which can be incremented by numbers.
 *
 * @tsplus static effect/core/io/Metrics/Metric.Ops counter
 */
export function counter(name: string): Metric.Counter<number> {
  return Metric.fromMetricKey(MetricKey.Counter(name))
}
