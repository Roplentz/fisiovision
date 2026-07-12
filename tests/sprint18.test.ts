import { describe, expect, it } from "vitest";
import { alignMetricSeries, benchmarkEstimators, multimodelReportToCsv, multimodelReportToMarkdown, parseSports2DCsv, type EstimatorSeries } from "../src/index.js";

const series = (estimator: EstimatorSeries["estimator"], offset = 0): EstimatorSeries => ({
  estimator, metricId: "knee_flexion_left", unit: "deg",
  samples: [0, 100, 200].map((timestampMs, index) => ({ timestampMs: timestampMs + offset, value: [10, 20, 30][index]! + (estimator === "mediapipe" ? 1 : 0) })),
});

describe("multimodel benchmark", () => {
  it("aligns unique frames within tolerance", () => {
    const aligned = alignMetricSeries(series("sports2d"), series("mediapipe", 10), 20);
    expect(aligned.reference).toHaveLength(3);
    expect(aligned.timestampErrors).toEqual([10, 10, 10]);
  });
  it("calculates pairwise agreement and reports", () => {
    const report = benchmarkEstimators([series("sports2d"), series("mediapipe", 10), series("rtmpose", 5)], 20, new Date("2026-07-12T00:00:00Z"));
    expect(report.comparisons).toHaveLength(3);
    expect(report.comparisons[0]?.agreement?.meanAbsoluteError).toBe(1);
    expect(multimodelReportToMarkdown(report, "test")).toContain("Benchmark multimodelo");
    expect(multimodelReportToCsv(report)).toContain("reference,candidate");
  });
  it("imports selected Sports2D columns", () => {
    const parsed = parseSports2DCsv("time,knee_left\n0,10\n0.1,20", { timestamp: "time", metrics: [{ column: "knee_left", metricId: "knee_flexion_left", unit: "deg" }] });
    expect(parsed[0]?.samples[1]).toEqual({ timestampMs: 100, value: 20 });
  });
});
