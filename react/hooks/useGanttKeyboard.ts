import { useCallback } from "react";
import type { Task, TimeUnit } from "../../modules/gantt/gantt.types.js";
import { useGanttStoreApi } from "./useGanttStore.js";

const SCALES: TimeUnit[] = ["day", "week", "month", "quarter", "year"];

export function useGanttKeyboard(opts: {
  flatRows: { task: Task }[];
  effectiveScale: TimeUnit;
}) {
  const storeApi = useGanttStoreApi();

  return useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const rows = opts.flatRows;
      if (rows.length === 0) return;
      const state = storeApi.getState();
      const currentIdx = state.focusedTaskId
        ? rows.findIndex((r) => r.task.id === state.focusedTaskId)
        : -1;

      const moveFocus = (nextIdx: number) => {
        const clamped = Math.max(0, Math.min(rows.length - 1, nextIdx));
        state.setFocusedTaskId(rows[clamped]!.task.id);
      };

      switch (e.key) {
        case "ArrowDown":  e.preventDefault(); moveFocus(currentIdx < 0 ? 0 : currentIdx + 1); return;
        case "ArrowUp":    e.preventDefault(); moveFocus(currentIdx < 0 ? rows.length - 1 : currentIdx - 1); return;
        case "Home":       e.preventDefault(); moveFocus(0); return;
        case "End":        e.preventDefault(); moveFocus(rows.length - 1); return;
        case "PageDown":   e.preventDefault(); moveFocus((currentIdx < 0 ? 0 : currentIdx) + 5); return;
        case "PageUp":     e.preventDefault(); moveFocus((currentIdx < 0 ? 0 : currentIdx) - 5); return;
        case "+":
        case "=": {
          e.preventDefault();
          const idx = SCALES.indexOf(opts.effectiveScale);
          if (idx > 0) state.setScale(SCALES[idx - 1]!);
          return;
        }
        case "-":
        case "_": {
          e.preventDefault();
          const idx = SCALES.indexOf(opts.effectiveScale);
          if (idx >= 0 && idx < SCALES.length - 1) state.setScale(SCALES[idx + 1]!);
          return;
        }
      }
    },
    [opts.flatRows, opts.effectiveScale, storeApi],
  );
}
