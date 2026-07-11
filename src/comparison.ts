import type { EngineResult } from "./types.js";

export interface GroundTruthTarget {
  expectedStatus: "accepted" | "rejected";
  expectedRepetitions?: number;
}

export interface SampleComparison {
  statusMatch: boolean;
  automaticStatus: EngineResult["status"];
  expectedStatus: GroundTruthTarget["expectedStatus"];
  automaticRepetitions: number | null;
  expectedRepetitions: number | null;
  repetitionAbsoluteError: number | null;
  outcome: "match" | "status_mismatch" | "count_mismatch" | "not_comparable";
}

export function compareResultToGroundTruth(
  result: EngineResult,
  target: GroundTruthTarget,
): SampleComparison {
  const automatic = result.metrics.find((metric) => metric.id === "repetition_count")?.value ?? null;
  const expected = target.expectedRepetitions ?? null;
  const statusMatch = result.status === target.expectedStatus;
  const error = automatic === null || expected === null ? null : Math.abs(automatic - expected);
  let outcome: SampleComparison["outcome"];
  if (!statusMatch) outcome = "status_mismatch";
  else if (error !== null && error !== 0) outcome = "count_mismatch";
  else if (target.expectedStatus === "rejected" || error !== null) outcome = "match";
  else outcome = "not_comparable";
  return {
    statusMatch,
    automaticStatus: result.status,
    expectedStatus: target.expectedStatus,
    automaticRepetitions: automatic,
    expectedRepetitions: expected,
    repetitionAbsoluteError: error,
    outcome,
  };
}

export function comparisonToMarkdown(sampleId: string, comparison: SampleComparison): string {
  const value = (input: number | null) => input === null ? "n/a" : String(input);
  return `# Comparação — ${sampleId}

| Indicador | Automático | Ground truth |
|---|---:|---:|
| Status | ${comparison.automaticStatus} | ${comparison.expectedStatus} |
| Repetições | ${value(comparison.automaticRepetitions)} | ${value(comparison.expectedRepetitions)} |

- Concordância de status: ${comparison.statusMatch ? "sim" : "não"}
- Erro absoluto de contagem: ${value(comparison.repetitionAbsoluteError)}
- Resultado: ${comparison.outcome}
`;
}
