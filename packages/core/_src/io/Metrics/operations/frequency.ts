/**
 * A string histogram metric, which keeps track of the counts of different
 * strings.
 *
 * @tsplus static effect/core/io/Metrics/Metric.Ops frequency
 */
export function frequency(name: string): Metric.Frequency<string> {
  return Metric.fromMetricKey(MetricKey.Frequency(name))
}
