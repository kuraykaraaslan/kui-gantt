export { GanttEngine } from "./gantt/gantt.engine.js";
export type { GanttEngineOptions } from "./gantt/gantt.engine.js";

export { createGanttStore } from "./gantt/gantt.store.js";
export type {
  GanttState,
  GanttActions,
  GanttStore,
  GanttStoreApi,
  GanttStoreOptions,
} from "./gantt/gantt.store.js";

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
} from "./gantt/gantt.types.js";

export {
  DEFAULT_MESSAGES,
  PIXELS_PER_DAY,
  BAR_HEIGHT,
  ROW_HEIGHT,
  SIDE_PANEL_WIDTH,
} from "./gantt/gantt.types.js";

export {
  MS_PER_DAY,
  startOfDay,
  diffDays,
  addDays,
  snapToWorkingDay,
  computeTimelineScale,
} from "./gantt/gantt.timeline.js";
export type { TimelineColumn, TimelineScale } from "./gantt/gantt.timeline.js";

export { computeCriticalPath } from "./gantt/gantt.critical-path.js";
export { computeResourceConflicts } from "./gantt/gantt.resource-conflicts.js";
