import { useStore } from "zustand/react";
import { useGanttEngine } from "./useGanttEngine";
import type { GanttStore, GanttStoreApi } from "../../modules/gantt/gantt.store";

export function useGanttStore<T>(selector: (s: GanttStore) => T): T {
  const engine = useGanttEngine();
  return useStore(engine.store, selector);
}

export function useGanttStoreApi(): GanttStoreApi {
  return useGanttEngine().store;
}
