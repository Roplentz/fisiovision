import type { MultimodelBenchmarkReport } from "./multimodel-benchmark.js";

export function multimodelReportToMarkdown(report: MultimodelBenchmarkReport, datasetId: string): string {
  const rows = report.comparisons.map((item) => {
    const a = item.agreement;
    return `| ${item.reference} | ${item.candidate} | ${item.metricId} | ${item.matchedFrames} | ${pct(item.referenceCoverage)} | ${a ? a.meanAbsoluteError.toFixed(3) : "n/a"} | ${a ? a.rootMeanSquareError.toFixed(3) : "n/a"} | ${a ? a.bias.toFixed(3) : "n/a"} |`;
  }).join("\n");
  return `# Benchmark multimodelo — ${datasetId}

| Referência | Candidato | Métrica | Frames | Cobertura | MAE | RMSE | Viés |
|---|---|---|---:|---:|---:|---:|---:|
${rows || "| n/a | n/a | n/a | 0 | 0% | n/a | n/a | n/a |"}

Tolerância temporal: ${report.toleranceMs} ms.

Sports2D é referência externa de engenharia, não ground truth clínico.
`;
}

export function multimodelReportToCsv(report: MultimodelBenchmarkReport): string {
  const header = "reference,candidate,metric_id,unit,matched_frames,reference_coverage,candidate_coverage,mean_timestamp_error_ms,mae,rmse,bias,loa_low,loa_high";
  const rows = report.comparisons.map((item) => {
    const a = item.agreement;
    return [item.reference,item.candidate,item.metricId,item.unit,item.matchedFrames,item.referenceCoverage,item.candidateCoverage,item.meanTimestampErrorMs,a?.meanAbsoluteError??"",a?.rootMeanSquareError??"",a?.bias??"",a?.limitsOfAgreement95[0]??"",a?.limitsOfAgreement95[1]??""].join(",");
  });
  return [header, ...rows].join("\n") + "\n";
}
function pct(value: number): string { return `${(value * 100).toFixed(1)}%` }
