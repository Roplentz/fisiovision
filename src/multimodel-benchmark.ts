import { compareMeasurements, type AgreementReport } from "./agreement.js";
import { mean } from "./math.js";

export type EstimatorId = "mediapipe" | "rtmpose" | "sports2d";

export interface TimedMetric {
  timestampMs: number;
  value: number;
  confidence?: number;
}

export interface EstimatorSeries {
  estimator: EstimatorId;
  metricId: string;
  unit: string;
  samples: TimedMetric[];
}

export interface PairwiseAgreement {
  reference: EstimatorId;
  candidate: EstimatorId;
  metricId: string;
  unit: string;
  matchedFrames: number;
  referenceCoverage: number;
  candidateCoverage: number;
  meanTimestampErrorMs: number;
  agreement: AgreementReport | null;
}

export interface MultimodelBenchmarkReport {
  schemaVersion: "fisiovision-multimodel-benchmark-v0.1";
  generatedAt: string;
  toleranceMs: number;
  comparisons: PairwiseAgreement[];
}

export function alignMetricSeries(
  reference: EstimatorSeries,
  candidate: EstimatorSeries,
  toleranceMs = 40,
): { reference: number[]; candidate: number[]; timestampErrors: number[] } {
  if (reference.metricId !== candidate.metricId || reference.unit !== candidate.unit) {
    throw new Error("series must use the same metric and unit");
  }
  if (toleranceMs < 0) throw new Error("toleranceMs must be non-negative");
  const aligned = { reference: [] as number[], candidate: [] as number[], timestampErrors: [] as number[] };
  const used = new Set<number>();
  for (const item of reference.samples) {
    let bestIndex = -1, bestError = Infinity;
    candidate.samples.forEach((other, index) => {
      const error = Math.abs(other.timestampMs - item.timestampMs);
      if (!used.has(index) && error <= toleranceMs && error < bestError) {
        bestIndex = index; bestError = error;
      }
    });
    if (bestIndex >= 0) {
      const other = candidate.samples[bestIndex]!;
      if (Number.isFinite(item.value) && Number.isFinite(other.value)) {
        aligned.reference.push(item.value);
        aligned.candidate.push(other.value);
        aligned.timestampErrors.push(bestError);
        used.add(bestIndex);
      }
    }
  }
  return aligned;
}

export function benchmarkEstimators(
  series: readonly EstimatorSeries[],
  toleranceMs = 40,
  now = new Date(),
): MultimodelBenchmarkReport {
  const comparisons: PairwiseAgreement[] = [];
  const pairs: Array<[EstimatorId, EstimatorId]> = [
    ["sports2d", "mediapipe"], ["sports2d", "rtmpose"], ["mediapipe", "rtmpose"],
  ];
  const keys = [...new Set(series.map((item) => `${item.metricId}::${item.unit}`))];
  for (const [referenceId, candidateId] of pairs) {
    for (const key of keys) {
      const [metricId, unit] = key.split("::") as [string, string];
      const reference = series.find((item) => item.estimator === referenceId && item.metricId === metricId && item.unit === unit);
      const candidate = series.find((item) => item.estimator === candidateId && item.metricId === metricId && item.unit === unit);
      if (!reference || !candidate) continue;
      const aligned = alignMetricSeries(reference, candidate, toleranceMs);
      comparisons.push({
        reference: referenceId, candidate: candidateId, metricId, unit,
        matchedFrames: aligned.reference.length,
        referenceCoverage: reference.samples.length ? aligned.reference.length / reference.samples.length : 0,
        candidateCoverage: candidate.samples.length ? aligned.candidate.length / candidate.samples.length : 0,
        meanTimestampErrorMs: mean(aligned.timestampErrors),
        agreement: aligned.reference.length >= 2 ? compareMeasurements(aligned.reference, aligned.candidate) : null,
      });
    }
  }
  return { schemaVersion: "fisiovision-multimodel-benchmark-v0.1", generatedAt: now.toISOString(), toleranceMs, comparisons };
}
