import { useContext } from "react";
import { GanttEngineContext } from "../GanttEngineContext.js";
import type { GanttEngine } from "../../modules/gantt/gantt.engine.js";

export function useGanttEngine(): GanttEngine {
  const engine = useContext(GanttEngineContext);
  if (!engine) throw new Error("useGanttEngine must be used inside <Gantt>");
  return engine;
}
