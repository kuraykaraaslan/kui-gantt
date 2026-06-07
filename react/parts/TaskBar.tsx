import { cn } from "../../libs/utils/cn";
import type { Task } from "../../modules/gantt/gantt.types";
import { BAR_HEIGHT, ROW_HEIGHT } from "../../modules/gantt/gantt.types";
import { diffDays } from "../../modules/gantt/gantt.timeline";

type TaskBarProps = {
  task: Task;
  rangeStart: Date;
  pixelsPerDay: number;
  rowIndex: number;
  isDepHoverTarget?: boolean;
  isCritical?: boolean;
  isFocused?: boolean;
  reducedMotion?: boolean;
  onMoveDown: (e: React.PointerEvent<HTMLElement>, taskId: string, barWidth: number) => void;
  onResizeStartDown: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
  onResizeEndDown: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
  onProgressDown: (e: React.PointerEvent<HTMLElement>, taskId: string, barWidth: number) => void;
  onDepSourceDown: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
  onHoverEnter?: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
  onHoverLeave?: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
};

export function TaskBar({ task, rangeStart, pixelsPerDay, rowIndex, isDepHoverTarget, isCritical, isFocused, reducedMotion, onMoveDown, onResizeStartDown, onResizeEndDown, onProgressDown, onDepSourceDown, onHoverEnter, onHoverLeave }: TaskBarProps) {
  const startOffsetDays = diffDays(rangeStart, task.start);
  const durationDays = Math.max(1, diffDays(task.start, task.end));
  const left = startOffsetDays * pixelsPerDay;
  const width = durationDays * pixelsPerDay;
  const top = rowIndex * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2;
  const progress = Math.max(0, Math.min(100, task.progress ?? 0));
  const progressX = (progress / 100) * width;

  return (
    <div
      role="gridcell"
      aria-label={`${task.name}: ${task.start.toDateString()} to ${task.end.toDateString()}, ${progress}% complete`}
      id={`gantt-bar-${task.id}`}
      data-task-id={task.id}
      className={cn(
        "gantt-task-bar group absolute rounded-md overflow-visible shadow-sm select-none",
        isCritical ? "bg-error-subtle border border-error/60" : "bg-primary-subtle border border-primary/40",
        isDepHoverTarget && "ring-2 ring-primary",
        isFocused && "ring-2 ring-border-focus z-10",
        !reducedMotion && "transition-colors",
      )}
      style={{ left, width, top, height: BAR_HEIGHT }}
      onPointerEnter={onHoverEnter ? (e) => onHoverEnter(e, task.id) : undefined}
      onPointerLeave={onHoverLeave ? (e) => onHoverLeave(e, task.id) : undefined}
    >
      <div
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 rounded-l-md overflow-hidden", isCritical ? "bg-error" : "bg-primary")}
        style={{ width: `${progress}%` }}
      />
      <button
        type="button" tabIndex={-1} aria-label="Move task"
        className="absolute inset-0 cursor-grab active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-md"
        style={{ background: "transparent" }}
        onPointerDown={(e) => onMoveDown(e, task.id, width)}
      />
      <div className="relative h-full flex items-center px-2 text-[11px] font-medium text-text-primary truncate pointer-events-none">
        <span className="truncate">{task.name}</span>
        <span className="ml-auto pl-2 tabular-nums text-text-secondary">{progress}%</span>
      </div>
      <button
        type="button" tabIndex={-1} aria-label="Resize start date"
        className="absolute top-0 bottom-0 left-0 w-1.5 cursor-ew-resize hover:bg-primary/30 rounded-l-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        onPointerDown={(e) => onResizeStartDown(e, task.id)}
      />
      <button
        type="button" tabIndex={-1} aria-label="Resize end date"
        className="absolute top-0 bottom-0 right-0 w-1.5 cursor-ew-resize hover:bg-primary/30 rounded-r-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
        onPointerDown={(e) => onResizeEndDown(e, task.id)}
      />
      {progress > 0 && progress < 100 && (
        <button
          type="button" tabIndex={-1} aria-label="Adjust progress"
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-surface-base border-2 border-primary cursor-ew-resize shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          style={{ left: progressX }}
          onPointerDown={(e) => onProgressDown(e, task.id, width)}
        />
      )}
      <button
        type="button" tabIndex={-1} aria-label="Create dependency from this task"
        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary border-2 border-surface-base shadow cursor-crosshair opacity-0 hover:opacity-100 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus transition-opacity"
        style={{ right: -6 }}
        onPointerDown={(e) => onDepSourceDown(e, task.id)}
      />
    </div>
  );
}
