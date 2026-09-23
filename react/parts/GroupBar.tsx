import { cn } from "../../libs/utils/cn.js";
import type { Task } from "../../modules/gantt/gantt.types.js";
import { BAR_HEIGHT, ROW_HEIGHT } from "../../modules/gantt/gantt.types.js";
import { diffDays } from "../../modules/gantt/gantt.timeline.js";

type GroupBarProps = {
  task: Task;
  rangeStart: Date;
  pixelsPerDay: number;
  rowIndex: number;
  isCritical?: boolean;
  isFocused?: boolean;
  onHoverEnter?: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
  onHoverLeave?: (e: React.PointerEvent<HTMLElement>, taskId: string) => void;
};

const SPINE = 5;
const TIP_H = 7;
const TIP_W = 7;

export function GroupBar({ task, rangeStart, pixelsPerDay, rowIndex, isCritical, isFocused, onHoverEnter, onHoverLeave }: GroupBarProps) {
  const startOffsetDays = diffDays(rangeStart, task.start);
  const durationDays = Math.max(1, diffDays(task.start, task.end));
  const left = startOffsetDays * pixelsPerDay;
  const width = durationDays * pixelsPerDay;
  const top = rowIndex * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2;
  const color = isCritical ? "fill-error" : "fill-text-primary";

  return (
    <div
      role="gridcell"
      aria-label={`Group ${task.name}: ${task.start.toDateString()} to ${task.end.toDateString()}`}
      id={`gantt-bar-${task.id}`}
      data-task-id={task.id}
      className={cn("gantt-group-bar absolute select-none", isFocused && "ring-2 ring-border-focus rounded z-10")}
      style={{ left, width, top, height: BAR_HEIGHT }}
      onPointerEnter={onHoverEnter ? (e) => onHoverEnter(e, task.id) : undefined}
      onPointerLeave={onHoverLeave ? (e) => onHoverLeave(e, task.id) : undefined}
    >
      <svg aria-hidden="true" width={width} height={BAR_HEIGHT} viewBox={`0 0 ${width} ${BAR_HEIGHT}`} className="overflow-visible">
        <rect x={0} y={4} width={width} height={SPINE} className={color} />
        <polygon points={`0,${4 + SPINE} ${TIP_W * 2},${4 + SPINE} ${TIP_W},${4 + SPINE + TIP_H}`} className={color} />
        <polygon points={`${width - TIP_W * 2},${4 + SPINE} ${width},${4 + SPINE} ${width - TIP_W},${4 + SPINE + TIP_H}`} className={color} />
      </svg>
      <span
        className={cn(
          "absolute top-0 left-0 right-0 px-1 text-[10px] font-semibold leading-none truncate pointer-events-none",
          isCritical ? "text-error" : "text-text-primary",
        )}
      >
        {task.name}
      </span>
    </div>
  );
}
