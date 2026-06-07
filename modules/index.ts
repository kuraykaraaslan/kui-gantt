export { GanttEngine } from "./gantt/gantt.engine";
export type { GanttEngineOptions } from "./gantt/gantt.engine";

export { createGanttStore } from "./gantt/gantt.store";
export type {
  GanttState,
  GanttActions,
  GanttStore,
  GanttStoreApi,
  GanttStoreOptions,
} from "./gantt/gantt.store";

export type {
  TaskId,
  TimeUnit,
  Task,
  Dependency,
  Baseline,
  GanttMessages,
  GanttTelemetry,
  DragMode,
  DragState,
  DepDrawState,
  GanttProps,
} from "./gantt/gantt.types";

export {
  DEFAULT_MESSAGES,
  PIXELS_PER_DAY,
  BAR_HEIGHT,
  ROW_HEIGHT,
  SIDE_PANEL_WIDTH,
} from "./gantt/gantt.types";

export {
  MS_PER_DAY,
  startOfDay,
  diffDays,
  addDays,
  snapToWorkingDay,
  computeTimelineScale,
} from "./gantt/gantt.timeline";
export type { TimelineColumn, TimelineScale } from "./gantt/gantt.timeline";

export { computeCriticalPath } from "./gantt/gantt.critical-path";
export { computeResourceConflicts } from "./gantt/gantt.resource-conflicts";
