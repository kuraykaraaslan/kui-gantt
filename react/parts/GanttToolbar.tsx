import { cn } from "../../libs/utils/cn.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faBolt } from "@fortawesome/free-solid-svg-icons";
import type { GanttMessages, TimeUnit } from "../../modules/gantt/gantt.types.js";
import { useGanttStore } from "../hooks/useGanttStore.js";
import { ExportMenu } from "./ExportMenu.js";
import type { ExportFormat } from "../hooks/useExport.js";

const SCALES: TimeUnit[] = ["day", "week", "month", "quarter", "year"];

type GanttToolbarProps = {
  messages: GanttMessages;
  controlledScale?: TimeUnit;
  showCriticalPathToggle?: boolean;
  exportFormats?: ExportFormat[];
  onExport?: (format: ExportFormat) => void;
};

export function GanttToolbar({ messages, controlledScale, showCriticalPathToggle, exportFormats, onExport }: GanttToolbarProps) {
  const storeScale    = useGanttStore((s) => s.scale);
  const setScale      = useGanttStore((s) => s.setScale);
  const criticalPath  = useGanttStore((s) => s.criticalPath);
  const setCriticalPath = useGanttStore((s) => s.setCriticalPath);
  const effective = controlledScale ?? storeScale;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-b border-border bg-surface-raised">
      <div className="flex items-center gap-2 text-text-primary">
        <FontAwesomeIcon icon={faCalendar} className="w-3.5 h-3.5 text-text-secondary" aria-hidden="true" />
        <h2 className="text-sm font-semibold">
          {messages.today}:{" "}
          <span className="tabular-nums font-normal text-text-secondary">{new Date().toLocaleDateString()}</span>
        </h2>
      </div>
      <div className="flex items-center gap-2">
        {exportFormats && exportFormats.length > 0 && onExport && <ExportMenu formats={exportFormats} onExport={onExport} />}
        {showCriticalPathToggle && (
          <button
            type="button" aria-pressed={criticalPath}
            onClick={() => setCriticalPath(!criticalPath)}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
              criticalPath
                ? "bg-error-subtle border-error/40 text-error"
                : "bg-surface-base border-border text-text-secondary hover:text-text-primary hover:bg-surface-overlay",
            )}
          >
            <FontAwesomeIcon icon={faBolt} className="w-3 h-3" aria-hidden="true" />
            Critical path
          </button>
        )}
        <div role="tablist" aria-label="Timeline scale" className="inline-flex items-center rounded-md border border-border bg-surface-base p-0.5">
          {SCALES.map((s) => {
            const active = s === effective;
            const label = ({ day: messages.scaleDay, week: messages.scaleWeek, month: messages.scaleMonth, quarter: messages.scaleQuarter, year: messages.scaleYear } as const)[s];
            return (
              <button
                key={s} type="button" role="tab" aria-selected={active}
                onClick={() => setScale(s)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
                  active ? "bg-primary text-primary-fg" : "text-text-secondary hover:text-text-primary hover:bg-surface-overlay",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
