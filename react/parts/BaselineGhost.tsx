import type { Baseline } from "../../modules/gantt/gantt.types.js";
import { BAR_HEIGHT, ROW_HEIGHT } from "../../modules/gantt/gantt.types.js";
import { diffDays } from "../../modules/gantt/gantt.timeline.js";

type BaselineGhostProps = {
  baseline: Baseline;
  rangeStart: Date;
  pixelsPerDay: number;
  rowIndex: number;
};

const GHOST_HEIGHT = 5;

export function BaselineGhost({ baseline, rangeStart, pixelsPerDay, rowIndex }: BaselineGhostProps) {
  const startOffset = diffDays(rangeStart, baseline.start);
  const duration = Math.max(1, diffDays(baseline.start, baseline.end));
  const left = startOffset * pixelsPerDay;
  const width = duration * pixelsPerDay;
  const top = rowIndex * ROW_HEIGHT + (ROW_HEIGHT + BAR_HEIGHT) / 2 + 1;

  return (
    <div
      aria-hidden="true"
      className="gantt-baseline absolute rounded-sm border border-dashed border-text-secondary/60 bg-text-secondary/10 pointer-events-none"
      style={{ left, top, width, height: GHOST_HEIGHT }}
    />
  );
}
