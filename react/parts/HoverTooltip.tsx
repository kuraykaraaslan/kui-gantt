import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Task } from "../../modules/gantt/gantt.types.js";

const MS_PER_DAY = 86400000;

type HoverTooltipProps = {
  task: Task | null;
  anchorRect: DOMRect | null;
  predecessorNames: string[];
  isCritical?: boolean;
  locale?: string;
};

export function HoverTooltip({ task, anchorRect, predecessorNames, isCritical, locale }: HoverTooltipProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; placement: "above" | "below" }>({ top: 0, left: 0, placement: "above" });

  useEffect(() => { setMounted(true); }, []);

  useLayoutEffect(() => {
    if (!task || !anchorRect || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    const margin = 8;
    const placeAbove = anchorRect.top - rect.height - margin >= 0;
    const top = placeAbove ? anchorRect.top - rect.height - margin : anchorRect.bottom + margin;
    let left = anchorRect.left;
    const maxLeft = window.innerWidth - rect.width - 8;
    if (left > maxLeft) left = maxLeft;
    if (left < 8) left = 8;
    setPos({ top, left, placement: placeAbove ? "above" : "below" });
  }, [task, anchorRect]);

  if (!mounted || !task || !anchorRect) return null;

  const durationDays = Math.max(0, Math.round((task.end.getTime() - task.start.getTime()) / MS_PER_DAY));
  const progress = Math.max(0, Math.min(100, task.progress ?? 0));
  const fmt = (d: Date) => d.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });

  return createPortal(
    <div
      ref={ref}
      role="tooltip"
      className="gantt-tooltip fixed z-50 pointer-events-none rounded-md border border-border bg-surface-base shadow-lg px-3 py-2 text-xs text-text-primary min-w-[200px] max-w-[280px]"
      style={{ top: pos.top, left: pos.left }}
      data-placement={pos.placement}
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="font-semibold truncate">{task.name}</span>
        {isCritical && (
          <span className="shrink-0 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide bg-error-subtle text-error">
            Critical
          </span>
        )}
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-[11px]">
        <dt className="text-text-secondary">Start</dt><dd className="tabular-nums">{fmt(task.start)}</dd>
        <dt className="text-text-secondary">End</dt><dd className="tabular-nums">{fmt(task.end)}</dd>
        <dt className="text-text-secondary">Duration</dt><dd className="tabular-nums">{durationDays} day{durationDays === 1 ? "" : "s"}</dd>
        {task.owner && (<><dt className="text-text-secondary">Owner</dt><dd className="truncate">{task.owner}</dd></>)}
        <dt className="text-text-secondary">Progress</dt><dd className="tabular-nums">{progress}%</dd>
        {predecessorNames.length > 0 && (
          <>
            <dt className="text-text-secondary self-start">Predecessor{predecessorNames.length === 1 ? "" : "s"}</dt>
            <dd className="truncate" title={predecessorNames.join(", ")}>{predecessorNames.join(", ")}</dd>
          </>
        )}
      </dl>
    </div>,
    document.body,
  );
}
