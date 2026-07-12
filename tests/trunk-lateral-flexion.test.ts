import { describe, expect, it } from "vitest";
import { runTrunkLateralFlexionProtocol, type Landmark, type PoseFrame } from "../src/index.js";

function frame(timestampMs: number, shoulderOffset: number, visibility = .99): PoseFrame {
  const landmarks: Landmark[] = Array.from({ length: 33 }, () => ({ x: .5, y: .5, visibility }));
  landmarks[11] = { x: .44 + shoulderOffset, y: .25, visibility };
  landmarks[12] = { x: .56 + shoulderOffset, y: .25, visibility };
  landmarks[23] = { x: .45, y: .55, visibility };
  landmarks[24] = { x: .55, y: .55, visibility };
  return { timestampMs, landmarks };
}
describe("trunk lateral flexion protocol", () => {
  it("measures bilateral range and symmetry", () => {
    const offsets = [0,.02,.04,.06,.08,.06,.04,.02,0,-.02,-.04,-.06,-.08,-.06,-.04,-.02,0,0,0,0];
    const output = runTrunkLateralFlexionProtocol(offsets.map((offset,index)=>frame(index*100,offset)), { smoothingAlpha: 1 });
    expect(output.status).toBe("accepted");
    expect(output.metrics.find((metric)=>metric.id==="trunk_lateral_flexion_range")?.value).toBeGreaterThan(25);
    expect(output.metrics.find((metric)=>metric.id==="trunk_lateral_flexion_symmetry")?.value).toBeCloseTo(1);
  });
  it("rejects movement below the minimum range", () => {
    const output = runTrunkLateralFlexionProtocol(Array.from({length:12},(_,index)=>frame(index*100,.005)));
    expect(output.status).toBe("rejected");
    expect(output.reasons.some((reason)=>reason.code==="insufficient_depth")).toBe(true);
  });
  it("rejects low visibility", () => {
    const output = runTrunkLateralFlexionProtocol(Array.from({length:12},(_,index)=>frame(index*100,.05,.2)));
    expect(output.status).toBe("rejected");
    expect(output.reasons.some((reason)=>reason.code==="low_visibility")).toBe(true);
  });
});
