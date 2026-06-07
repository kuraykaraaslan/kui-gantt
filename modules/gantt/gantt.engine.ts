import { createGanttStore, type GanttStoreApi, type GanttStore, type GanttStoreOptions } from "./gantt.store";
import type { TimeUnit } from "./gantt.types";

export type GanttEngineOptions = {
  tasks?: GanttStoreOptions["tasks"];
  dependencies?: GanttStoreOptions["dependencies"];
  scale?: TimeUnit;
  criticalPath?: boolean;
  onTelemetry?: GanttStoreOptions["onTelemetry"];
};

/**
 * Vanilla TypeScript controller for the Gantt chart.
 * Holds the Zustand vanilla store. Framework-agnostic — no React imports.
 */
export class GanttEngine {
  readonly store: GanttStoreApi;

  constructor(opts: GanttEngineOptions = {}) {
    this.store = createGanttStore({
      tasks: opts.tasks ?? [],
      dependencies: opts.dependencies ?? [],
      scale: opts.scale ?? "week",
      criticalPath: opts.criticalPath ?? false,
      onTelemetry: opts.onTelemetry,
    });
  }

  get state(): GanttStore {
    return this.store.getState();
  }

  setScale(scale: TimeUnit): void {
    this.store.getState().setScale(scale);
  }

  setCriticalPath(v: boolean): void {
    this.store.getState().setCriticalPath(v);
  }

  dispose(): void {}
}
