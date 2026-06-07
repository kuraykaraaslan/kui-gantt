import { createContext } from "react";
import type { GanttEngine } from "../modules/gantt/gantt.engine";

export const GanttEngineContext = createContext<GanttEngine | null>(null);
