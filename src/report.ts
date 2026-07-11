import type { BenchmarkReport } from "./validation.js";

export function benchmarkReportToMarkdown(report: BenchmarkReport, datasetId: string, datasetVersion: string): string {
  const mae = report.repetitionMae === null ? "n/a" : report.repetitionMae.toFixed(3);
  const failures = report.failures.length === 0
    ? "Nenhuma falha observada."
    : report.failures.map((failure) => `- ${failure.id}: ${failure.reason}`).join("\n");
  return `# Relatório de validação — ${datasetId}@${datasetVersion}

## Resultado

| Indicador | Valor |
|---|---:|
| Casos | ${report.cases} |
| Acurácia de aceite/rejeição | ${(report.statusAccuracy * 100).toFixed(1)}% |
| MAE de repetições | ${mae} |
| Aceitos pelo motor | ${report.accepted} |
| Rejeitados pelo motor | ${report.rejected} |

## Falhas

${failures}

## Limite de uso

Benchmark técnico para pesquisa. Não demonstra validade clínica e requer revisão profissional.
`;
}

export function benchmarkReportToCsv(report: BenchmarkReport): string {
  const rows = [
    ["metric", "value"],
    ["cases", String(report.cases)],
    ["status_accuracy", String(report.statusAccuracy)],
    ["repetition_mae", report.repetitionMae === null ? "" : String(report.repetitionMae)],
    ["accepted", String(report.accepted)],
    ["rejected", String(report.rejected)],
  ];
  return rows.map((row) => row.join(",")).join("\n") + "\n";
}
