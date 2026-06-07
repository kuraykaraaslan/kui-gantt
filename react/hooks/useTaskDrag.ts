import { useCallback, useEffect, useRef } from "react";
import type { DragMode, Task } from "../../modules/gantt/gantt.types";
import { useGanttStoreApi } from "./useGanttStore";
import { addDays, diffDays, snapToWorkingDay } from "../../modules/gantt/gantt.timeline";

export type UseTaskDragApi = {
  onBarPointerDown: (
    e: React.PointerEvent<HTMLElement>,
    taskId: string,
    mode: DragMode,
    barWidth: number,
  ) => void;
};

export function useTaskDrag(opts: {
  pixelsPerDay: number;
  workingDays?: number[];
  holidays?: Date[];
  onTaskUpdate?: (task: Task) => Promise<void> | void;
}): UseTaskDragApi {
  const storeApi = useGanttStoreApi();
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const ctxRef = useRef<{ barWidth: number } | null>(null);

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      const drag = storeApi.getState().drag;
      if (!drag) return;
      const dx = e.clientX - drag.pointerStartX;
      const ppd = optsRef.current.pixelsPerDay;
      if (drag.mode === "progress") {
        const barWidth = ctxRef.current?.barWidth ?? 100;
        const deltaPct = (dx / barWidth) * 100;
        const next = Math.max(0, Math.min(100, drag.originProgress + deltaPct));
        storeApi.getState().updateDrag(0, next);
      } else {
        const rawDelta = Math.round(dx / ppd);
        const { workingDays, holidays } = optsRef.current;
        let deltaDays = rawDelta;
        if (workingDays && workingDays.length > 0) {
          const anchor = drag.mode === "resize-end" ? drag.originEnd : drag.originStart;
          const tentative = addDays(anchor, rawDelta);
          const snapped = snapToWorkingDay(tentative, workingDays, holidays, rawDelta >= 0 ? 1 : -1);
          deltaDays = diffDays(anchor, snapped);
        }
        storeApi.getState().updateDrag(deltaDays, null);
      }
    }

    async function onPointerUp() {
      const drag = storeApi.getState().drag;
      if (!drag) return;
      const snapshot = storeApi.getState().workingTasks.find((t: Task) => t.id === drag.taskId) ?? null;
      const updated = storeApi.getState().commitDrag();
      ctxRef.current = null;
      if (!updated) return;
      try {
        await optsRef.current.onTaskUpdate?.(updated);
      } catch {
        if (snapshot) {
          const tasks = storeApi.getState().workingTasks.slice();
          const idx = tasks.findIndex((t: Task) => t.id === snapshot.id);
          if (idx !== -1) tasks[idx] = snapshot;
          storeApi.setState({ workingTasks: tasks });
        }
      }
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (!storeApi.getState().drag) return;
      storeApi.getState().cancelDrag();
      ctxRef.current = null;
    }

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [storeApi]);

  const onBarPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>, taskId: string, mode: DragMode, barWidth: number) => {
      if (e.button !== 0) return;
      e.preventDefault();
      e.stopPropagation();
      ctxRef.current = { barWidth };
      storeApi.getState().beginDrag(taskId, mode, e.clientX);
    },
    [storeApi],
  );

  return { onBarPointerDown };
}
