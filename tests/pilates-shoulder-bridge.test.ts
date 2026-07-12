import { describe, expect, it } from "vitest";
import { runPilatesShoulderBridgeProtocol, type Landmark, type PoseFrame } from "../src/index.js";

function frame(timestampMs:number,lift:number,visibility=.99):PoseFrame{
  const landmarks:Landmark[]=Array.from({length:33},()=>({x:.5,y:.5,visibility}));
  landmarks[11]={x:.25,y:.65,visibility}; landmarks[23]={x:.5,y:.7-lift,visibility};
  landmarks[25]={x:.7,y:.65,visibility}; landmarks[27]={x:.86,y:.72,visibility};
  return{timestampMs,landmarks};
}
describe("Pilates Shoulder Bridge",()=>{
  it("counts a complete bridge and returns finite metrics",()=>{
    const lifts=[0,0,.03,.08,.13,.16,.13,.08,.03,0,0];
    const output=runPilatesShoulderBridgeProtocol(lifts.map((lift,index)=>frame(index*100,lift)),{minimumRepetitionDurationMs:400});
    expect(output.status).toBe("accepted");
    expect(output.metrics.find((metric)=>metric.id==="repetition_count")?.value).toBe(1);
    expect(output.metrics.find((metric)=>metric.id==="shoulder_bridge_pelvic_lift_max")?.value).toBeGreaterThan(.5);
    expect(output.metrics.every((metric)=>Number.isFinite(metric.value))).toBe(true);
  });
  it("rejects an incomplete bridge",()=>{
    const output=runPilatesShoulderBridgeProtocol(Array.from({length:12},(_,index)=>frame(index*100,index*.01)));
    expect(output.status).toBe("rejected");
    expect(output.reasons.some((reason)=>reason.code==="incomplete_cycle")).toBe(true);
  });
  it("supports the right side and quality rejection",()=>{
    const frames=Array.from({length:12},(_,index)=>{const value=frame(index*100,0,.2);value.landmarks[12]={x:.25,y:.65,visibility:.2};value.landmarks[24]={x:.5,y:.7,visibility:.2};value.landmarks[26]={x:.7,y:.65,visibility:.2};value.landmarks[28]={x:.86,y:.72,visibility:.2};return value});
    expect(runPilatesShoulderBridgeProtocol(frames,{side:"right"}).reasons.some((reason)=>reason.code==="low_visibility")).toBe(true);
  });
});
