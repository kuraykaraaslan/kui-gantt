import { useEffect, useRef } from "react";
import { cn } from "../../libs/utils/cn.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import type { ExportFormat } from "../hooks/useExport.js";

const LABELS: Record<ExportFormat, string> = { png: "PNG image", pdf: "PDF (Print…)", csv: "CSV" };

type ExportMenuProps = { formats: ExportFormat[]; onExport: (format: ExportFormat) => void };

export function ExportMenu({ formats, onExport }: ExportMenuProps) {
  const ref = useRef<HTMLDetailsElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current?.open) return;
      if (!ref.current.contains(e.target as Node)) ref.current.open = false;
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  if (formats.length === 0) return null;

  return (
    <details ref={ref} className="gantt-export-menu relative">
      <summary className={cn("list-none inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus bg-surface-base border-border text-text-secondary hover:text-text-primary hover:bg-surface-overlay")}>
        <FontAwesomeIcon icon={faDownload} className="w-3 h-3" aria-hidden="true" />
        Export
        <FontAwesomeIcon icon={faChevronDown} className="w-2.5 h-2.5" aria-hidden="true" />
      </summary>
      <div role="menu" className="absolute right-0 top-full mt-1 min-w-[160px] z-20 rounded-md border border-border bg-surface-base shadow-lg p-1">
        {formats.map((f) => (
          <button
            key={f} type="button" role="menuitem"
            onClick={() => { if (ref.current) ref.current.open = false; onExport(f); }}
            className="w-full text-left px-2 py-1.5 rounded text-xs text-text-primary hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
          >
            {LABELS[f]}
          </button>
        ))}
      </div>
    </details>
  );
}
