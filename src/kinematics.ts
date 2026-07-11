import type { Landmark } from "./types.js";

const RAD_TO_DEG = 180 / Math.PI;

export function angleDegrees(a: Landmark, vertex: Landmark, c: Landmark): number | null {
  const ux = a.x - vertex.x;
  const uy = a.y - vertex.y;
  const vx = c.x - vertex.x;
  const vy = c.y - vertex.y;
  const denominator = Math.hypot(ux, uy) * Math.hypot(vx, vy);
  if (denominator === 0) return null;
  const cosine = Math.max(-1, Math.min(1, (ux * vx + uy * vy) / denominator));
  return Math.acos(cosine) * RAD_TO_DEG;
}

export function inclinationFromVertical(top: Landmark, bottom: Landmark): number | null {
  const dx = top.x - bottom.x;
  const dy = top.y - bottom.y;
  if (dx === 0 && dy === 0) return null;
  return Math.atan2(Math.abs(dx), Math.abs(dy)) * RAD_TO_DEG;
}

export function midpoint(a: Landmark, b: Landmark): Landmark {
  const point: Landmark = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  if (a.z !== undefined && b.z !== undefined) point.z = (a.z + b.z) / 2;
  if (a.visibility !== undefined && b.visibility !== undefined) {
    point.visibility = Math.min(a.visibility, b.visibility);
  }
  return point;
}
