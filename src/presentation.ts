import type { EngineResult, MetricValue } from "./types.js";

const METRIC_LABELS: Record<string, string> = {
  repetition_count: "Repetições",
  repetition_time: "Tempo médio",
  knee_flexion_range_left: "Amplitude do joelho esquerdo",
  knee_flexion_range_right: "Amplitude do joelho direito",
  trunk_inclination_p95: "Inclinação do tronco (P95)",
};

export interface ResultViewModel {
  status: EngineResult["status"];
  statusLabel: string;
  confidencePercent: number;
  metrics: Array<MetricValue & { label: string; formattedValue: string }>;
  reasons: string[];
  disclaimer: string;
}

export function engineResultToViewModel(result: EngineResult): ResultViewModel {
  return {
    status: result.status,
    statusLabel: result.status === "accepted" ? "Análise aceita" : "Análise rejeitada",
    confidencePercent: Math.round(result.confidence * 100),
    metrics: result.metrics.map((metric) => ({
      ...metric,
      label: METRIC_LABELS[metric.id] ?? metric.id,
      formattedValue: formatMetric(metric),
    })),
    reasons: result.reasons.map((reason) => reason.message),
    disclaimer: result.disclaimer,
  };
}

function formatMetric(metric: MetricValue): string {
  if (metric.unit === "count") return String(Math.round(metric.value));
  if (metric.unit === "s") return `${metric.value.toFixed(2)} s`;
  if (metric.unit === "deg") return `${metric.value.toFixed(1)}°`;
  return `${metric.value.toFixed(3)} ${metric.unit}`.trim();
}
