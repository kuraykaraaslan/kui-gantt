import { cn } from "../../libs/utils/cn.js";
import type { Task } from "../../modules/gantt/gantt.types.js";
import { ROW_HEIGHT } from "../../modules/gantt/gantt.types.js";
import { diffDays } from "../../modules/gantt/gantt.timeline.js";

type MilestoneProps = {
  task: Task;
  rangeStart: Date;
  pixelsPerDay: number;
  rowIndex: number;
  isCritical?: boolean;
  isFocused?: boolean;
  onHoverEnter?: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
  onHoverLeave?: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
};

const DIAMOND_SIZE = 14;

export function Milestone({ task, rangeStart, pixelsPerDay, rowIndex, isCritical, isFocused, onHoverEnter, onHoverLeave }: MilestoneProps) {
  const offsetDays = diffDays(rangeStart, task.start);
  const left = offsetDays * pixelsPerDay - DIAMOND_SIZE / 2;
  const top = rowIndex * ROW_HEIGHT + (ROW_HEIGHT - DIAMOND_SIZE) / 2;

  return (
    <div
      role="gridcell"
      aria-label={`Milestone ${task.name}: ${task.start.toDateString()}`}
      id={`gantt-bar-${task.id}`}
      data-task-id={task.id}
      className={cn("gantt-milestone absolute pointer-events-none", isFocused && "ring-2 ring-border-focus rounded-md z-10")}
      style={{ left, top, width: DIAMOND_SIZE, height: DIAMOND_SIZE }}
      onPointerEnter={onHoverEnter ? (e) => onHoverEnter(e, task.id) : undefined}
      onPointerLeave={onHoverLeave ? (e) => onHoverLeave(e, task.id) : undefined}
    >
      <div
        aria-hidden="true"
        className={cn(
          "w-full h-full rotate-45 rounded-[2px] shadow pointer-events-auto",
          isCritical ? "bg-error border border-error/80" : "bg-primary border border-primary/80",
        )}
      />
    </div>
  );
}
