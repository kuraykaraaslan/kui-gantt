import { cn } from "../../libs/utils/cn.js";
import type { TimelineScale } from "../../modules/gantt/gantt.timeline.js";

type TimelineHeaderProps = { scale: TimelineScale; className?: string };

export function TimelineHeader({ scale, className }: TimelineHeaderProps) {
  return (
    <div
      role="row"
      aria-rowindex={1}
      className={cn("gantt-timeline-header flex h-12 shrink-0 border-b border-border bg-surface-raised", className)}
      style={{ width: scale.totalWidth }}
    >
      {scale.columns.map((col, i) => (
        <div
          key={`${col.start.toISOString()}-${i}`}
          role="columnheader"
          aria-colindex={i + 1}
          className="flex flex-col items-center justify-center shrink-0 border-r border-border text-text-secondary select-none"
          style={{ width: col.width }}
        >
          <span className="text-xs font-semibold tabular-nums text-text-primary leading-tight">{col.label}</span>
          {col.subLabel && <span className="text-[10px] leading-tight">{col.subLabel}</span>}
        </div>
      ))}
    </div>
  );
}
