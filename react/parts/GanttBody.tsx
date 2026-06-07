import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../libs/utils/cn";
import type { Baseline, Dependency, GanttMessages, Task, TaskId, TimeUnit } from "../../modules/gantt/gantt.types";
import { ROW_HEIGHT } from "../../modules/gantt/gantt.types";
import { useTimelineScale } from "../hooks/useTimelineScale";
import { useScroll } from "../hooks/useScroll";
import { useTaskDrag } from "../hooks/useTaskDrag";
import { useDependencyDraw } from "../hooks/useDependencyDraw";
import { useCriticalPath } from "../hooks/useCriticalPath";
import { useResourceConflicts } from "../hooks/useResourceConflicts";
import { useGanttKeyboard } from "../hooks/useGanttKeyboard";
import { useGanttStore } from "../hooks/useGanttStore";
import { TaskListSide } from "./TaskListSide";
import { TimelineHeader } from "./TimelineHeader";
import { TaskBar } from "./TaskBar";
import { TodayLine } from "./TodayLine";
import { DependencyLayer } from "./DependencyLayer";
import { HoverTooltip } from "./HoverTooltip";
import { Milestone } from "./Milestone";
import { GroupBar } from "./GroupBar";
import { BaselineGhost } from "./BaselineGhost";
import { NonWorkingDaysLayer } from "./NonWorkingDaysLayer";

const VIEWPORT_HEIGHT = 512;
const VIRTUALIZE_THRESHOLD = 60;
const BUFFER_ROWS = 6;

function flattenTree(tasks: Task[], collapsed: Set<TaskId>): { task: Task; depth: number; hasChildren: boolean }[] {
  const byParent = new Map<TaskId | undefined, Task[]>();
  const ids = new Set(tasks.map((t) => t.id));
  for (const t of tasks) {
    const key = t.parentId && ids.has(t.parentId) ? t.parentId : undefined;
    const arr = byParent.get(key) ?? [];
    arr.push(t);
    byParent.set(key, arr);
  }
  const out: { task: Task; depth: number; hasChildren: boolean }[] = [];
  function walk(parentKey: TaskId | undefined, depth: number) {
    for (const child of byParent.get(parentKey) ?? []) {
      const hasChildren = (byParent.get(child.id) ?? []).length > 0;
      out.push({ task: child, depth, hasChildren });
      if (hasChildren && !collapsed.has(child.id)) walk(child.id, depth + 1);
    }
  }
  walk(undefined, 0);
  return out;
}

type GanttBodyProps = {
  messages: GanttMessages;
  controlledScale?: TimeUnit;
  baselines?: Baseline[];
  workingDays?: number[];
  holidays?: Date[];
  locale?: string;
  reducedMotion?: boolean;
  onTaskUpdate?: (task: Task) => Promise<void> | void;
  onDependencyCreate?: (dep: Dependency) => Promise<void> | void;
  onDependencyDelete?: (id: string) => Promise<void> | void;
};

export function GanttBody({ messages, controlledScale, baselines, workingDays, holidays, locale, reducedMotion, onTaskUpdate, onDependencyCreate, onDependencyDelete }: GanttBodyProps) {
  const storeScale     = useGanttStore((s) => s.scale);
  const collapsed      = useGanttStore((s) => s.collapsed);
  const workingTasks   = useGanttStore((s) => s.workingTasks);
  const dependencies   = useGanttStore((s) => s.dependencies);
  const drag           = useGanttStore((s) => s.drag);
  const depDraw        = useGanttStore((s) => s.depDraw);
  const criticalPathOn = useGanttStore((s) => s.criticalPath);
  const focusedTaskId  = useGanttStore((s) => s.focusedTaskId);
  const toggleCollapse = useGanttStore((s) => s.toggleCollapse);

  const effectiveScale = controlledScale ?? storeScale;
  const timeline = useTimelineScale(workingTasks, effectiveScale, locale);
  const { sideRef, timelineRef, headerRef, onTimelineScroll: rawScroll, onSideScroll } = useScroll();

  const [scrollTop, setScrollTop] = useState(0);
  const onTimelineScroll: React.UIEventHandler<HTMLDivElement> = (e) => {
    rawScroll();
    setScrollTop((e.currentTarget as HTMLDivElement).scrollTop);
  };

  const tasksToRender: Task[] = useMemo(() => {
    if (!drag) return workingTasks;
    const msPerDay = 86400000;
    return workingTasks.map((t) => {
      if (t.id !== drag.taskId) return t;
      switch (drag.mode) {
        case "move": return { ...t, start: new Date(drag.originStart.getTime() + drag.deltaDays * msPerDay), end: new Date(drag.originEnd.getTime() + drag.deltaDays * msPerDay) };
        case "resize-start": { const next = new Date(drag.originStart.getTime() + drag.deltaDays * msPerDay); return { ...t, start: next.getTime() >= drag.originEnd.getTime() ? new Date(drag.originEnd.getTime() - msPerDay) : next, end: drag.originEnd }; }
        case "resize-end": { const next = new Date(drag.originEnd.getTime() + drag.deltaDays * msPerDay); return { ...t, start: drag.originStart, end: next.getTime() <= drag.originStart.getTime() ? new Date(drag.originStart.getTime() + msPerDay) : next }; }
        case "progress": return { ...t, progress: drag.progressOverride ?? t.progress };
      }
    });
  }, [drag, workingTasks]);

  const flatRows = useMemo(() => flattenTree(tasksToRender, collapsed), [tasksToRender, collapsed]);
  const flatRowIndex = useMemo(() => {
    const m: Record<TaskId, number> = {};
    flatRows.forEach((row, i) => { m[row.task.id] = i; });
    return m;
  }, [flatRows]);

  const visible = useMemo(() => {
    if (flatRows.length <= VIRTUALIZE_THRESHOLD) return { start: 0, end: flatRows.length };
    const first = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - BUFFER_ROWS);
    const last  = Math.min(flatRows.length, Math.ceil((scrollTop + VIEWPORT_HEIGHT) / ROW_HEIGHT) + BUFFER_ROWS);
    return { start: first, end: last };
  }, [flatRows.length, scrollTop]);

  const visibleRows = useMemo(
    () => flatRows.slice(visible.start, visible.end).map((row, j) => ({ row, idx: visible.start + j })),
    [flatRows, visible.start, visible.end],
  );

  const { onBarPointerDown } = useTaskDrag({ pixelsPerDay: timeline.pixelsPerDay, workingDays, holidays, onTaskUpdate });
  const { beginFromTask }    = useDependencyDraw({ bodyRef: timelineRef, onDependencyCreate, onDependencyDelete });
  const criticalSet = useCriticalPath({ tasks: workingTasks, dependencies, enabled: criticalPathOn });
  const conflictSet = useResourceConflicts(workingTasks);
  const handleKeyDown = useGanttKeyboard({ flatRows, effectiveScale });

  useEffect(() => {
    if (!focusedTaskId) return;
    const rowIdx = flatRowIndex[focusedTaskId];
    const tl = timelineRef.current;
    if (rowIdx == null || !tl) return;
    const top = rowIdx * ROW_HEIGHT;
    if (top < tl.scrollTop) tl.scrollTop = top;
    else if (top + ROW_HEIGHT > tl.scrollTop + tl.clientHeight) tl.scrollTop = top + ROW_HEIGHT - tl.clientHeight;
  }, [focusedTaskId, flatRowIndex, timelineRef]);

  const [hover, setHover] = useState<{ taskId: TaskId; rect: DOMRect } | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current); }, []);
  useEffect(() => {
    if (drag || depDraw) {
      if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
      setHover(null);
    }
  }, [drag, depDraw]);

  const onBarHoverEnter = (e: React.PointerEvent<HTMLElement>, taskId: TaskId) => {
    if (drag || depDraw) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setHover({ taskId, rect }), 200);
  };
  const onBarHoverLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = null;
    setHover(null);
  };

  const hoveredTask = hover ? tasksToRender.find((t) => t.id === hover.taskId) ?? null : null;
  const predecessorNames = useMemo(() => {
    if (!hover) return [];
    return dependencies.filter((d) => d.to === hover.taskId).map((d) => tasksToRender.find((t) => t.id === d.from)?.name).filter((n): n is string => !!n);
  }, [hover, dependencies, tasksToRender]);

  const totalHeight = flatRows.length * ROW_HEIGHT;

  return (
    <div className="flex w-full max-h-[32rem]" tabIndex={0} onKeyDown={handleKeyDown} aria-activedescendant={focusedTaskId ? `gantt-bar-${focusedTaskId}` : undefined}>
      <div ref={sideRef} onScroll={onSideScroll} className="overflow-y-auto overflow-x-hidden scrollbar-hide">
        <TaskListSide flatRows={flatRows} collapsed={collapsed} onToggleCollapse={toggleCollapse} messages={messages} totalHeight={totalHeight} conflictSet={conflictSet} />
      </div>
      <div className="flex-1 min-w-0 flex flex-col">
        <div ref={headerRef} className="overflow-hidden border-b border-border">
          <TimelineHeader scale={timeline} />
        </div>
        <div ref={timelineRef} onScroll={onTimelineScroll} className="relative flex-1 overflow-auto">
          <div className="relative" style={{ width: timeline.totalWidth, height: totalHeight }}>
            {visibleRows.map(({ row, idx }) => (
              <div key={row.task.id} aria-hidden="true"
                className={cn("absolute left-0 right-0 border-b border-border/60", idx % 2 === 1 ? "bg-surface-overlay/40" : "bg-transparent")}
                style={{ top: idx * ROW_HEIGHT, height: ROW_HEIGHT, width: timeline.totalWidth }}
              />
            ))}
            <NonWorkingDaysLayer rangeStart={timeline.rangeStart} rangeEnd={timeline.rangeEnd} pixelsPerDay={timeline.pixelsPerDay} totalHeight={totalHeight} workingDays={workingDays} holidays={holidays} />
            <TodayLine rangeStart={timeline.rangeStart} rangeEnd={timeline.rangeEnd} pixelsPerDay={timeline.pixelsPerDay} totalHeight={totalHeight} />
            {baselines?.map((b) => {
              const rowIndex = flatRowIndex[b.taskId];
              if (rowIndex == null || rowIndex < visible.start || rowIndex >= visible.end) return null;
              return <BaselineGhost key={`baseline-${b.taskId}`} baseline={b} rangeStart={timeline.rangeStart} pixelsPerDay={timeline.pixelsPerDay} rowIndex={rowIndex} />;
            })}
            {visibleRows.map(({ row, idx }) => {
              if (row.task.isMilestone) return <Milestone key={row.task.id} task={row.task} rangeStart={timeline.rangeStart} pixelsPerDay={timeline.pixelsPerDay} rowIndex={idx} isCritical={criticalSet.has(row.task.id)} isFocused={focusedTaskId === row.task.id} onHoverEnter={onBarHoverEnter} onHoverLeave={onBarHoverLeave} />;
              if (row.task.isGroup) return <GroupBar key={row.task.id} task={row.task} rangeStart={timeline.rangeStart} pixelsPerDay={timeline.pixelsPerDay} rowIndex={idx} isCritical={criticalSet.has(row.task.id)} isFocused={focusedTaskId === row.task.id} onHoverEnter={onBarHoverEnter} onHoverLeave={onBarHoverLeave} />;
              return (
                <TaskBar key={row.task.id} task={row.task} rangeStart={timeline.rangeStart} pixelsPerDay={timeline.pixelsPerDay} rowIndex={idx}
                  isDepHoverTarget={depDraw?.hoverTargetId === row.task.id} isCritical={criticalSet.has(row.task.id)} isFocused={focusedTaskId === row.task.id} reducedMotion={reducedMotion}
                  onMoveDown={(e, id, w) => onBarPointerDown(e, id, "move", w)}
                  onResizeStartDown={(e, id) => onBarPointerDown(e, id, "resize-start", 0)}
                  onResizeEndDown={(e, id) => onBarPointerDown(e, id, "resize-end", 0)}
                  onProgressDown={(e, id, w) => onBarPointerDown(e, id, "progress", w)}
                  onDepSourceDown={(e, id) => beginFromTask(e, id)}
                  onHoverEnter={onBarHoverEnter} onHoverLeave={onBarHoverLeave}
                />
              );
            })}
            <DependencyLayer tasks={tasksToRender} flatRowIndex={flatRowIndex} rangeStart={timeline.rangeStart} pixelsPerDay={timeline.pixelsPerDay} totalWidth={timeline.totalWidth} totalHeight={totalHeight} criticalSet={criticalSet} />
          </div>
        </div>
      </div>
      <HoverTooltip task={hoveredTask} anchorRect={hover?.rect ?? null} predecessorNames={predecessorNames} isCritical={hoveredTask ? criticalSet.has(hoveredTask.id) : false} locale={locale} />
    </div>
  );
}
