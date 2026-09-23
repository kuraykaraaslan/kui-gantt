import { useMemo } from "react";
import type { Task, TimeUnit } from "../../modules/gantt/gantt.types.js";
import { computeTimelineScale, type TimelineScale } from "../../modules/gantt/gantt.timeline.js";

export function useTimelineScale(tasks: Task[], scale: TimeUnit, locale?: string): TimelineScale {
  return useMemo(() => computeTimelineScale(tasks, scale, locale), [tasks, scale, locale]);
}
