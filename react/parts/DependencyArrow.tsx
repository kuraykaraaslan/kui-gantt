import { cn } from "../../libs/utils/cn";
import type { Dependency, Task } from "../../modules/gantt/gantt.types";
import { BAR_HEIGHT, ROW_HEIGHT } from "../../modules/gantt/gantt.types";
import { diffDays } from "../../modules/gantt/gantt.timeline";

type Anchor = { x: number; y: number };

type DependencyArrowProps = {
  dep: Dependency;
  tasks: Task[];
  rangeStart: Date;
  pixelsPerDay: number;
  taskRowIndex: Record<string, number>;
  selected: boolean;
  isCritical?: boolean;
  onSelect: (id: string) => void;
};

function anchors(dep: Dependency, from: Task, to: Task, rangeStart: Date, pixelsPerDay: number, fromRow: number, toRow: number): { start: Anchor; end: Anchor } {
  const fromStartX = diffDays(rangeStart, from.start) * pixelsPerDay;
  const fromEndX = diffDays(rangeStart, from.end) * pixelsPerDay;
  const toStartX = diffDays(rangeStart, to.start) * pixelsPerDay;
  const toEndX = diffDays(rangeStart, to.end) * pixelsPerDay;
  const fromY = fromRow * ROW_HEIGHT + (ROW_HEIGHT + BAR_HEIGHT) / 2 - BAR_HEIGHT / 2;
  const toY = toRow * ROW_HEIGHT + (ROW_HEIGHT + BAR_HEIGHT) / 2 - BAR_HEIGHT / 2;
  switch (dep.type ?? "FS") {
    case "SS": return { start: { x: fromStartX, y: fromY }, end: { x: toStartX, y: toY } };
    case "FF": return { start: { x: fromEndX,   y: fromY }, end: { x: toEndX,   y: toY } };
    case "SF": return { start: { x: fromStartX, y: fromY }, end: { x: toEndX,   y: toY } };
    case "FS":
    default:   return { start: { x: fromEndX,   y: fromY }, end: { x: toStartX, y: toY } };
  }
}

function orthogonalPath(start: Anchor, end: Anchor): string {
  const midX = end.x - 8 > start.x + 8 ? (start.x + end.x) / 2 : start.x + 12;
  return `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
}

export function DependencyArrow({ dep, tasks, rangeStart, pixelsPerDay, taskRowIndex, selected, isCritical, onSelect }: DependencyArrowProps) {
  const from = tasks.find((t) => t.id === dep.from);
  const to = tasks.find((t) => t.id === dep.to);
  const fromRow = taskRowIndex[dep.from];
  const toRow = taskRowIndex[dep.to];
  if (!from || !to || fromRow == null || toRow == null) return null;

  const { start, end } = anchors(dep, from, to, rangeStart, pixelsPerDay, fromRow, toRow);
  const d = orthogonalPath(start, end);

  return (
    <g
      role="button"
      aria-label={`Dependency from ${from.name} to ${to.name} (${dep.type ?? "FS"})`}
      tabIndex={0}
      className="gantt-dep cursor-pointer"
      style={{ pointerEvents: "auto" }}
      onClick={(e) => { e.stopPropagation(); onSelect(dep.id); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(dep.id); } }}
    >
      <path d={d} fill="none" stroke="transparent" strokeWidth={10} />
      <path
        d={d} fill="none"
        className={cn("transition-colors", selected ? "stroke-primary" : isCritical ? "stroke-error" : "stroke-text-secondary group-hover:stroke-primary")}
        strokeWidth={selected || isCritical ? 2 : 1.5}
        markerEnd={selected ? "url(#gantt-arrow-active)" : isCritical ? "url(#gantt-arrow-critical)" : "url(#gantt-arrow)"}
      />
    </g>
  );
}
