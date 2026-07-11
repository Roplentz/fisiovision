import { mean } from "./math.js";
import type { SampleComparison } from "./comparison.js";

export interface ValidationSample {
  id: string;
  comparison: SampleComparison;
}

export interface ConfusionMatrix {
  trueAccepted: number;
  trueRejected: number;
  falseAccepted: number;
  falseRejected: number;
}

export interface AggregateValidationReport {
  schemaVersion: "fisiovision-aggregate-v0.1";
  samples: number;
  matrix: ConfusionMatrix;
  accuracy: number;
  sensitivity: number | null;
  specificity: number | null;
  repetitionMae: number | null;
  rejectionRate: number;
  statusMismatches: string[];
  countMismatches: string[];
}

export function aggregateValidation(samples: readonly ValidationSample[]): AggregateValidationReport {
  const matrix: ConfusionMatrix = { trueAccepted: 0, trueRejected: 0, falseAccepted: 0, falseRejected: 0 };
  const errors: number[] = [];
  const statusMismatches: string[] = [];
  const countMismatches: string[] = [];
  for (const sample of samples) {
    const { comparison: c } = sample;
    if (c.expectedStatus === "accepted" && c.automaticStatus === "accepted") matrix.trueAccepted += 1;
    else if (c.expectedStatus === "rejected" && c.automaticStatus === "rejected") matrix.trueRejected += 1;
    else if (c.expectedStatus === "rejected") matrix.falseAccepted += 1;
    else matrix.falseRejected += 1;
    if (c.repetitionAbsoluteError !== null) errors.push(c.repetitionAbsoluteError);
    if (!c.statusMatch) statusMismatches.push(sample.id);
    if (c.statusMatch && c.repetitionAbsoluteError !== null && c.repetitionAbsoluteError > 0) countMismatches.push(sample.id);
  }
  const total = samples.length;
  const expectedAccepted = matrix.trueAccepted + matrix.falseRejected;
  const expectedRejected = matrix.trueRejected + matrix.falseAccepted;
  return {
    schemaVersion: "fisiovision-aggregate-v0.1",
    samples: total,
    matrix,
    accuracy: total === 0 ? 0 : (matrix.trueAccepted + matrix.trueRejected) / total,
    sensitivity: expectedAccepted === 0 ? null : matrix.trueAccepted / expectedAccepted,
    specificity: expectedRejected === 0 ? null : matrix.trueRejected / expectedRejected,
    repetitionMae: errors.length === 0 ? null : mean(errors),
    rejectionRate: total === 0 ? 0 : (matrix.trueRejected + matrix.falseRejected) / total,
    statusMismatches,
    countMismatches,
  };
}

export function aggregateReportToMarkdown(report: AggregateValidationReport, datasetId: string): string {
  const percent = (value: number | null) => value === null ? "n/a" : `${(value * 100).toFixed(1)}%`;
  const number = (value: number | null) => value === null ? "n/a" : value.toFixed(3);
  return `# Validação consolidada — ${datasetId}

| Indicador | Valor |
|---|---:|
| Amostras | ${report.samples} |
| Acurácia | ${percent(report.accuracy)} |
| Sensibilidade | ${percent(report.sensitivity)} |
| Especificidade | ${percent(report.specificity)} |
| MAE de repetições | ${number(report.repetitionMae)} |
| Taxa de rejeição | ${percent(report.rejectionRate)} |

## Matriz de confusão

| Esperado / Automático | Aceito | Rejeitado |
|---|---:|---:|
| Aceito | ${report.matrix.trueAccepted} | ${report.matrix.falseRejected} |
| Rejeitado | ${report.matrix.falseAccepted} | ${report.matrix.trueRejected} |

## Divergências

- Status: ${report.statusMismatches.join(", ") || "nenhuma"}
- Contagem: ${report.countMismatches.join(", ") || "nenhuma"}

Relatório técnico de pesquisa. Não demonstra validade clínica isoladamente.
`;
}

export function aggregateReportToCsv(report: AggregateValidationReport): string {
  const rows = [
    ["metric", "value"],
    ["samples", report.samples],
    ["accuracy", report.accuracy],
    ["sensitivity", report.sensitivity ?? ""],
    ["specificity", report.specificity ?? ""],
    ["repetition_mae", report.repetitionMae ?? ""],
    ["rejection_rate", report.rejectionRate],
    ["true_accepted", report.matrix.trueAccepted],
    ["true_rejected", report.matrix.trueRejected],
    ["false_accepted", report.matrix.falseAccepted],
    ["false_rejected", report.matrix.falseRejected],
  ];
  return rows.map((row) => row.join(",")).join("\n") + "\n";
}
