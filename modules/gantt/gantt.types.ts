export type TaskId = string;

export type TimeUnit = "day" | "week" | "month" | "quarter" | "year";

export type Task = {
  id: TaskId;
  name: string;
  start: Date;
  end: Date;
  progress?: number;
  owner?: string;
  parentId?: TaskId;
  isMilestone?: boolean;
  isGroup?: boolean;
  collapsed?: boolean;
  critical?: boolean;
  data?: unknown;
};

export type Dependency = {
  id: string;
  from: TaskId;
  to: TaskId;
  type?: "FS" | "SS" | "FF" | "SF";
  lag?: number;
};

export type Baseline = {
  taskId: TaskId;
  start: Date;
  end: Date;
};

export type GanttMessages = {
  today: string;
  scaleDay: string;
  scaleWeek: string;
  scaleMonth: string;
  scaleQuarter: string;
  scaleYear: string;
  taskColumn: string;
  ownerColumn: string;
  progressColumn: string;
};

export type GanttTelemetry =
  | { kind: "scale-change"; scale: TimeUnit }
  | { kind: "task-toggle"; taskId: TaskId; collapsed: boolean }
  | { kind: "task-drag-commit"; taskId: TaskId; mode: DragMode }
  | { kind: "dependency-create"; dependencyId: string }
  | { kind: "dependency-delete"; dependencyId: string };

export type DragMode = "move" | "resize-start" | "resize-end" | "progress";

export type DragState = {
  taskId: TaskId;
  mode: DragMode;
  pointerStartX: number;
  originStart: Date;
  originEnd: Date;
  originProgress: number;
  deltaDays: number;
  progressOverride: number | null;
};

export type DepDrawState = {
  sourceId: TaskId;
  x: number;
  y: number;
  hoverTargetId: TaskId | null;
};

export type GanttProps = {
  tasks: Task[];
  dependencies?: Dependency[];
  baselines?: Baseline[];
  scale?: TimeUnit;
  workingDays?: number[];
  holidays?: Date[];
  criticalPath?: boolean;
  onTaskUpdate?: (task: Task) => Promise<void> | void;
  onDependencyCreate?: (dep: Dependency) => Promise<void> | void;
  onDependencyDelete?: (id: string) => Promise<void> | void;
  exportFormats?: ("png" | "pdf" | "csv")[];
  messages?: Partial<GanttMessages>;
  locale?: string;
  reducedMotion?: boolean;
  onTelemetry?: (event: GanttTelemetry) => void;
  ariaLabel?: string;
  className?: string;
};

export const DEFAULT_MESSAGES: GanttMessages = {
  today: "Today",
  scaleDay: "Day",
  scaleWeek: "Week",
  scaleMonth: "Month",
  scaleQuarter: "Quarter",
  scaleYear: "Year",
  taskColumn: "Task",
  ownerColumn: "Owner",
  progressColumn: "%",
};

export const PIXELS_PER_DAY: Record<TimeUnit, number> = {
  day: 32,
  week: 14,
  month: 6,
  quarter: 2.5,
  year: 1.2,
};

export const BAR_HEIGHT = 24;
export const ROW_HEIGHT = 36;
export const SIDE_PANEL_WIDTH = 320;
