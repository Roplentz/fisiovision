import { mean } from "./math.js";
import type { EngineResult } from "./types.js";

export interface BenchmarkCase {
  id: string;
  expectedStatus: "accepted" | "rejected";
  expectedRepetitions?: number;
  result: EngineResult;
}

export interface BenchmarkReport {
  schemaVersion: "fisiovision-benchmark-v0.1";
  cases: number;
  statusAccuracy: number;
  repetitionMae: number | null;
  accepted: number;
  rejected: number;
  failures: Array<{ id: string; reason: string }>;
}

export function evaluateBenchmark(cases: readonly BenchmarkCase[]): BenchmarkReport {
  const failures: BenchmarkReport["failures"] = [];
  const repetitionErrors: number[] = [];
  let accepted = 0;

  for (const item of cases) {
    if (item.result.status === "accepted") accepted += 1;
    if (item.result.status !== item.expectedStatus) {
      failures.push({ id: item.id, reason: `status: expected ${item.expectedStatus}, got ${item.result.status}` });
    }
    if (item.expectedRepetitions !== undefined) {
      const count = item.result.metrics.find((metric) => metric.id === "repetition_count")?.value;
      if (count === undefined) failures.push({ id: item.id, reason: "repetition_count metric missing" });
      else repetitionErrors.push(Math.abs(count - item.expectedRepetitions));
    }
  }

  return {
    schemaVersion: "fisiovision-benchmark-v0.1",
    cases: cases.length,
    statusAccuracy: cases.length === 0 ? 0 : (cases.length - failures.filter((f) => f.reason.startsWith("status:")).length) / cases.length,
    repetitionMae: repetitionErrors.length === 0 ? null : mean(repetitionErrors),
    accepted,
    rejected: cases.length - accepted,
    failures,
  };
}
