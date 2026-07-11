import { describe, expect, it } from "vitest";
import { aggregateReportToCsv, aggregateReportToMarkdown, aggregateValidation, type ValidationSample } from "../src/index.js";

const samples: ValidationSample[] = [
  { id: "tp", comparison: { statusMatch: true, automaticStatus: "accepted", expectedStatus: "accepted", automaticRepetitions: 2, expectedRepetitions: 2, repetitionAbsoluteError: 0, outcome: "match" } },
  { id: "tn", comparison: { statusMatch: true, automaticStatus: "rejected", expectedStatus: "rejected", automaticRepetitions: null, expectedRepetitions: null, repetitionAbsoluteError: null, outcome: "match" } },
  { id: "fp", comparison: { statusMatch: false, automaticStatus: "accepted", expectedStatus: "rejected", automaticRepetitions: 1, expectedRepetitions: null, repetitionAbsoluteError: null, outcome: "status_mismatch" } },
  { id: "fn", comparison: { statusMatch: false, automaticStatus: "rejected", expectedStatus: "accepted", automaticRepetitions: null, expectedRepetitions: 2, repetitionAbsoluteError: null, outcome: "status_mismatch" } },
];

describe("dataset aggregation", () => {
  it("calculates confusion matrix and rates", () => {
    const report = aggregateValidation(samples);
    expect(report.matrix).toEqual({ trueAccepted: 1, trueRejected: 1, falseAccepted: 1, falseRejected: 1 });
    expect(report.accuracy).toBe(0.5);
    expect(report.sensitivity).toBe(0.5);
    expect(report.specificity).toBe(0.5);
    expect(report.rejectionRate).toBe(0.5);
  });
  it("renders Markdown and CSV", () => {
    const report = aggregateValidation(samples);
    expect(aggregateReportToMarkdown(report, "dataset-01")).toContain("| Aceito | 1 | 1 |");
    expect(aggregateReportToCsv(report)).toContain("false_rejected,1");
  });
  it("uses null for undefined denominators", () => {
    expect(aggregateValidation(samples.slice(0, 1)).specificity).toBeNull();
  });
});
