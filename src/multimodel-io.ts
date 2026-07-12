import type { EstimatorId, EstimatorSeries } from "./multimodel-benchmark.js";

export interface Sports2DColumnMapping {
  timestamp: string;
  metrics: Array<{ column: string; metricId: string; unit: string }>;
}

export function parseSports2DCsv(csv: string, mapping: Sports2DColumnMapping): EstimatorSeries[] {
  const lines = csv.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) throw new Error("Sports2D CSV has no data");
  const headers = parseCsvLine(lines[0]!);
  const timeIndex = headers.indexOf(mapping.timestamp);
  if (timeIndex < 0) throw new Error(`timestamp column not found: ${mapping.timestamp}`);
  const outputs = mapping.metrics.map((metric) => {
    const index = headers.indexOf(metric.column);
    if (index < 0) throw new Error(`metric column not found: ${metric.column}`);
    return { definition: metric, index, samples: [] as Array<{ timestampMs: number; value: number }> };
  });
  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line);
    const seconds = Number(values[timeIndex]);
    if (!Number.isFinite(seconds)) continue;
    for (const output of outputs) {
      const value = Number(values[output.index]);
      if (Number.isFinite(value)) output.samples.push({ timestampMs: seconds * 1000, value });
    }
  }
  return outputs.map((output) => ({
    estimator: "sports2d", metricId: output.definition.metricId, unit: output.definition.unit, samples: output.samples,
  }));
}

export function parseEstimatorSeriesJson(json: string, expectedEstimator: EstimatorId): EstimatorSeries[] {
  const value = JSON.parse(json) as unknown;
  if (!Array.isArray(value)) throw new Error("estimator series JSON must be an array");
  const series = value as EstimatorSeries[];
  for (const item of series) {
    if (item.estimator !== expectedEstimator) throw new Error(`unexpected estimator: ${item.estimator}`);
    if (!item.metricId || !item.unit || !Array.isArray(item.samples)) throw new Error("invalid estimator series");
  }
  return series;
}

function parseCsvLine(line: string): string[] {
  const fields: string[] = []; let current = "", quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const character = line[i]!;
    if (character === '"') {
      if (quoted && line[i + 1] === '"') { current += '"'; i += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) { fields.push(current.trim()); current = ""; }
    else current += character;
  }
  fields.push(current.trim());
  return fields;
}
