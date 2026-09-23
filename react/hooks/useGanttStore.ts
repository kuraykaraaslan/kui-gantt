import { useStore } from "zustand/react";
import { useGanttEngine } from "./useGanttEngine.js";
import type { GanttStore, GanttStoreApi } from "../../modules/gantt/gantt.store.js";

export function useGanttStore<T>(selector: (s: GanttStore) => T): T {
  const engine = useGanttEngine();
  return useStore(engine.store, selector);
}

export function useGanttStoreApi(): GanttStoreApi {
  return useGanttEngine().store;
}
