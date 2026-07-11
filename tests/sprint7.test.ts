import { describe, expect, it } from "vitest";
import { createSamplingPlan, extractionProgress } from "../src/index.js";

describe("local video extraction", () => {
  it("creates a deterministic 15 fps plan", () => {
    const plan = createSamplingPlan(2, 15);
    expect(plan.timestampsMs).toHaveLength(31);
    expect(plan.timestampsMs[1]).toBeCloseTo(66.667, 2);
    expect(plan.timestampsMs.at(-1)).toBeCloseTo(2000);
  });
  it("caps long videos", () => {
    expect(createSamplingPlan(3600, 30, 100).timestampsMs).toHaveLength(100);
  });
  it("validates fps and clamps progress", () => {
    expect(() => createSamplingPlan(1, 61)).toThrow();
    expect(extractionProgress(12, 10)).toBe(1);
  });
});
