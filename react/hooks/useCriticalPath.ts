import { useMemo } from "react";
import type { Dependency, Task, TaskId } from "../../modules/gantt/gantt.types.js";
import { computeCriticalPath } from "../../modules/gantt/gantt.critical-path.js";

export function useCriticalPath(opts: {
  tasks: Task[];
  dependencies: Dependency[];
  enabled: boolean;
}): Set<TaskId> {
  return useMemo(() => computeCriticalPath(opts), [opts.tasks, opts.dependencies, opts.enabled]);
}
