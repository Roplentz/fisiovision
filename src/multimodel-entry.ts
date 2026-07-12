import { readFile, writeFile } from "node:fs/promises";
import { benchmarkEstimators, type EstimatorSeries } from "./multimodel-benchmark.js";
import { multimodelReportToCsv, multimodelReportToMarkdown } from "./multimodel-report.js";

interface Manifest {
  schemaVersion: "fisiovision-multimodel-run-v0.1";
  datasetId: string;
  toleranceMs?: number;
  inputs: Array<{ path: string; estimator: "mediapipe" | "rtmpose" | "sports2d" }>;
  outputPrefix: string;
}
const manifestPath = process.argv[2];
if (!manifestPath) throw new Error("usage: npm run benchmark:multimodel -- manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Manifest;
if (manifest.schemaVersion !== "fisiovision-multimodel-run-v0.1") throw new Error("unsupported manifest");
const series: EstimatorSeries[] = [];
for (const input of manifest.inputs) {
  const parsed = JSON.parse(await readFile(input.path, "utf8")) as EstimatorSeries[];
  if (!parsed.every((item) => item.estimator === input.estimator)) throw new Error(`estimator mismatch: ${input.path}`);
  series.push(...parsed);
}
const report = benchmarkEstimators(series, manifest.toleranceMs ?? 40);
await Promise.all([
  writeFile(manifest.outputPrefix + ".json", JSON.stringify(report, null, 2) + "\n"),
  writeFile(manifest.outputPrefix + ".md", multimodelReportToMarkdown(report, manifest.datasetId)),
  writeFile(manifest.outputPrefix + ".csv", multimodelReportToCsv(report)),
]);
console.log(JSON.stringify({ event: "multimodel_benchmark_completed", comparisons: report.comparisons.length }));
