import { useCallback } from "react";
import type { Dependency, Task } from "../../modules/gantt/gantt.types.js";

export type ExportFormat = "png" | "pdf" | "csv";

export function useExport(opts: {
  tasks: Task[];
  dependencies: Dependency[];
  contentRef: React.RefObject<HTMLElement | null>;
  filenameBase?: string;
}) {
  const base = opts.filenameBase ?? "gantt";

  const exportCsv = useCallback(() => {
    const rows: string[][] = [
      ["id", "name", "start", "end", "progress", "owner", "parentId", "isMilestone", "isGroup"],
      ...opts.tasks.map((t) => [
        t.id, t.name,
        t.start.toISOString().slice(0, 10),
        t.end.toISOString().slice(0, 10),
        String(t.progress ?? ""),
        t.owner ?? "", t.parentId ?? "",
        t.isMilestone ? "true" : "",
        t.isGroup ? "true" : "",
      ]),
      [],
      ["dependency_id", "from", "to", "type", "lag"],
      ...opts.dependencies.map((d) => [d.id, d.from, d.to, d.type ?? "FS", String(d.lag ?? 0)]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => {
        const s = String(cell ?? "");
        return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
      }).join(","))
      .join("\n");
    triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8" }), `${base}.csv`);
  }, [opts.tasks, opts.dependencies, base]);

  const exportPdf = useCallback(() => { window.print(); }, []);

  const exportPng = useCallback(async () => {
    const el = opts.contentRef.current;
    if (!el) throw new Error("Export target not mounted");
    const rect = el.getBoundingClientRect();
    const w = Math.ceil(rect.width);
    const h = Math.ceil(rect.height);
    if (w === 0 || h === 0) throw new Error("Export target has zero size");
    const cloned = el.cloneNode(true) as HTMLElement;
    const svg =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">` +
        `<foreignObject width="100%" height="100%">` +
          `<div xmlns="http://www.w3.org/1999/xhtml" style="background:${getComputedStyle(el).backgroundColor || "white"};color:${getComputedStyle(el).color || "black"};font-family:${getComputedStyle(el).fontFamily};">` +
            cloned.outerHTML +
          `</div>` +
        `</foreignObject>` +
      `</svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }));
    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Failed to load Gantt snapshot"));
        img.src = url;
      });
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context unavailable");
      ctx.drawImage(img, 0, 0);
      await new Promise<void>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error("Canvas toBlob returned null"));
          triggerDownload(blob, `${base}.png`);
          resolve();
        }, "image/png");
      });
    } finally {
      URL.revokeObjectURL(url);
    }
  }, [opts.contentRef, base]);

  const run = useCallback(
    (format: ExportFormat) => {
      if (format === "csv") exportCsv();
      else if (format === "pdf") exportPdf();
      else if (format === "png") return exportPng();
    },
    [exportCsv, exportPdf, exportPng],
  );

  return { run, exportCsv, exportPdf, exportPng };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
