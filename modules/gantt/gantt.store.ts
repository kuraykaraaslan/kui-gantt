import { createStore } from "zustand/vanilla";
import type { StoreApi } from "zustand/vanilla";
import type {
  DepDrawState,
  Dependency,
  DragMode,
  DragState,
  GanttTelemetry,
  Task,
  TaskId,
  TimeUnit,
} from "./gantt.types.js";

export type GanttState = {
  scale: TimeUnit;
  collapsed: Set<TaskId>;
  workingTasks: Task[];
  dependencies: Dependency[];
  drag: DragState | null;
  depDraw: DepDrawState | null;
  selectedDepId: string | null;
  criticalPath: boolean;
  focusedTaskId: TaskId | null;
};

export type GanttActions = {
  setScale: (s: TimeUnit) => void;
  toggleCollapse: (id: TaskId) => boolean;
  seedTasks: (tasks: Task[]) => void;
  seedDependencies: (deps: Dependency[]) => void;
  beginDrag: (taskId: TaskId, mode: DragMode, pointerStartX: number) => void;
  updateDrag: (deltaDays: number, progressOverride: number | null) => void;
  commitDrag: () => Task | null;
  cancelDrag: () => void;
  beginDepDraw: (sourceId: TaskId, x: number, y: number) => void;
  updateDepDraw: (x: number, y: number, hoverTargetId: TaskId | null) => void;
  commitDepDraw: () => Dependency | null;
  cancelDepDraw: () => void;
  selectDep: (id: string | null) => void;
  removeDependency: (id: string) => string | null;
  setCriticalPath: (v: boolean) => void;
  setFocusedTaskId: (id: TaskId | null) => void;
};

export type GanttStore = GanttState & GanttActions;
export type GanttStoreApi = StoreApi<GanttStore>;

function clampProgress(n: number): number {
  return Math.max(0, Math.min(100, n));
}

function applyDragToTask(task: Task, drag: DragState): Task {
  const { mode, deltaDays, originStart, originEnd, progressOverride } = drag;
  const msPerDay = 86400000;
  switch (mode) {
    case "move":
      return {
        ...task,
        start: new Date(originStart.getTime() + deltaDays * msPerDay),
        end: new Date(originEnd.getTime() + deltaDays * msPerDay),
      };
    case "resize-start": {
      const newStart = new Date(originStart.getTime() + deltaDays * msPerDay);
      if (newStart.getTime() >= originEnd.getTime()) {
        return { ...task, start: new Date(originEnd.getTime() - msPerDay), end: originEnd };
      }
      return { ...task, start: newStart, end: originEnd };
    }
    case "resize-end": {
      const newEnd = new Date(originEnd.getTime() + deltaDays * msPerDay);
      if (newEnd.getTime() <= originStart.getTime()) {
        return { ...task, start: originStart, end: new Date(originStart.getTime() + msPerDay) };
      }
      return { ...task, start: originStart, end: newEnd };
    }
    case "progress":
      return { ...task, progress: clampProgress(progressOverride ?? task.progress ?? 0) };
  }
}

export type GanttStoreOptions = {
  tasks: Task[];
  dependencies: Dependency[];
  scale: TimeUnit;
  criticalPath?: boolean;
  onTelemetry?: (e: GanttTelemetry) => void;
};

export function createGanttStore(opts: GanttStoreOptions): GanttStoreApi {
  const initialCollapsed = new Set<TaskId>();
  for (const t of opts.tasks) if (t.collapsed) initialCollapsed.add(t.id);

  return createStore<GanttStore>()((set, get) => ({
    scale: opts.scale,
    collapsed: initialCollapsed,
    workingTasks: opts.tasks,
    dependencies: opts.dependencies,
    drag: null,
    depDraw: null,
    selectedDepId: null,
    criticalPath: opts.criticalPath ?? false,
    focusedTaskId: null,

    setScale: (s) => {
      set({ scale: s });
      opts.onTelemetry?.({ kind: "scale-change", scale: s });
    },

    toggleCollapse: (id) => {
      const prev = get().collapsed;
      const next = new Set(prev);
      const wasCollapsed = next.has(id);
      if (wasCollapsed) next.delete(id);
      else next.add(id);
      set({ collapsed: next });
      opts.onTelemetry?.({ kind: "task-toggle", taskId: id, collapsed: !wasCollapsed });
      return !wasCollapsed;
    },

    seedTasks: (tasks) => set({ workingTasks: tasks }),
    seedDependencies: (deps) => set({ dependencies: deps }),

    beginDrag: (taskId, mode, pointerStartX) => {
      const task = get().workingTasks.find((t) => t.id === taskId);
      if (!task) return;
      set({
        drag: {
          taskId,
          mode,
          pointerStartX,
          originStart: task.start,
          originEnd: task.end,
          originProgress: task.progress ?? 0,
          deltaDays: 0,
          progressOverride: null,
        },
      });
    },

    updateDrag: (deltaDays, progressOverride) => {
      const drag = get().drag;
      if (!drag) return;
      set({ drag: { ...drag, deltaDays, progressOverride } });
    },

    commitDrag: () => {
      const drag = get().drag;
      if (!drag) return null;
      const tasks = get().workingTasks;
      const idx = tasks.findIndex((t) => t.id === drag.taskId);
      if (idx === -1) {
        set({ drag: null });
        return null;
      }
      const updated = applyDragToTask(tasks[idx]!, drag);
      const next = tasks.slice();
      next[idx] = updated;
      set({ workingTasks: next, drag: null });
      opts.onTelemetry?.({ kind: "task-drag-commit", taskId: updated.id, mode: drag.mode });
      return updated;
    },

    cancelDrag: () => set({ drag: null }),

    beginDepDraw: (sourceId, x, y) => set({ depDraw: { sourceId, x, y, hoverTargetId: null } }),

    updateDepDraw: (x, y, hoverTargetId) => {
      const cur = get().depDraw;
      if (!cur) return;
      set({ depDraw: { ...cur, x, y, hoverTargetId } });
    },

    commitDepDraw: () => {
      const cur = get().depDraw;
      if (!cur) return null;
      const targetId = cur.hoverTargetId;
      set({ depDraw: null });
      if (!targetId || targetId === cur.sourceId) return null;
      const dep: Dependency = {
        id: `dep-${cur.sourceId}-${targetId}-${Date.now()}`,
        from: cur.sourceId,
        to: targetId,
        type: "FS",
      };
      set({ dependencies: [...get().dependencies, dep] });
      opts.onTelemetry?.({ kind: "dependency-create", dependencyId: dep.id });
      return dep;
    },

    cancelDepDraw: () => set({ depDraw: null }),

    selectDep: (id) => set({ selectedDepId: id }),

    setCriticalPath: (v) => set({ criticalPath: v }),

    setFocusedTaskId: (id) => set({ focusedTaskId: id }),

    removeDependency: (id) => {
      const deps = get().dependencies;
      if (!deps.some((d) => d.id === id)) return null;
      set({ dependencies: deps.filter((d) => d.id !== id), selectedDepId: null });
      opts.onTelemetry?.({ kind: "dependency-delete", dependencyId: id });
      return id;
    },
  }));
}
