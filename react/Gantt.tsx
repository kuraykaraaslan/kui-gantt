import { useEffect, useRef } from "react";
import { cn } from "../libs/utils/cn.js";
import type { GanttProps } from "../modules/gantt/gantt.types.js";
import type { GanttStore } from "../modules/gantt/gantt.store.js";
import { DEFAULT_MESSAGES } from "../modules/gantt/gantt.types.js";
import { GanttEngine } from "../modules/gantt/gantt.engine.js";
import { GanttEngineContext } from "./GanttEngineContext.js";
import { GanttToolbar } from "./parts/GanttToolbar.js";
import { GanttBody } from "./parts/GanttBody.js";
import { useGanttStore } from "./hooks/useGanttStore.js";
import { useExport } from "./hooks/useExport.js";
import type { ExportFormat } from "./hooks/useExport.js";

type InnerProps = Omit<GanttProps, "tasks" | "dependencies"> & {
  mergedMessages: Required<NonNullable<GanttProps["messages"]>>;
  exportFormats?: ExportFormat[];
};

function GanttInner({ mergedMessages, scale, criticalPath, baselines, workingDays, holidays, locale, exportFormats, reducedMotion, onTaskUpdate, onDependencyCreate, onDependencyDelete, className }: InnerProps) {
  const tasks        = useGanttStore((s) => s.workingTasks);
  const dependencies = useGanttStore((s) => s.dependencies);
  const ganttRef     = useRef<HTMLDivElement>(null);
  const { run: handleExport } = useExport({ tasks, dependencies, contentRef: ganttRef });

  return (
    <div ref={ganttRef} className={cn("border border-border rounded-lg overflow-hidden bg-surface-base flex flex-col", className)}>
      <GanttToolbar
        messages={mergedMessages}
        controlledScale={scale}
        showCriticalPathToggle={criticalPath !== undefined}
        exportFormats={exportFormats}
        onExport={handleExport}
      />
      <GanttBody
        messages={mergedMessages}
        controlledScale={scale}
        baselines={baselines}
        workingDays={workingDays}
        holidays={holidays}
        locale={locale}
        reducedMotion={reducedMotion}
        onTaskUpdate={onTaskUpdate}
        onDependencyCreate={onDependencyCreate}
        onDependencyDelete={onDependencyDelete}
      />
    </div>
  );
}

export function Gantt({
  tasks,
  dependencies = [],
  scale,
  criticalPath,
  messages: messagesProp,
  onTelemetry,
  ...rest
}: GanttProps) {
  const mergedMessages = { ...DEFAULT_MESSAGES, ...messagesProp } as Required<NonNullable<GanttProps["messages"]>>;

  const engineRef = useRef<GanttEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new GanttEngine({ tasks, dependencies, scale: scale ?? "week", criticalPath, onTelemetry });
  }
  const engine = engineRef.current;

  useEffect(() => {
    engine.store.setState((s: GanttStore) => ({ ...s, workingTasks: tasks, dependencies: dependencies ?? [] }));
  }, [engine, tasks, dependencies]);

  useEffect(() => {
    if (scale !== undefined) engine.setScale(scale);
  }, [engine, scale]);

  useEffect(() => {
    if (criticalPath !== undefined) engine.setCriticalPath(criticalPath);
  }, [engine, criticalPath]);

  useEffect(() => () => engine.dispose(), [engine]);

  return (
    <GanttEngineContext.Provider value={engine}>
      <GanttInner {...rest} mergedMessages={mergedMessages} scale={scale} criticalPath={criticalPath} />
    </GanttEngineContext.Provider>
  );
}
