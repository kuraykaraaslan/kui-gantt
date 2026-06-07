import { useMemo } from "react";
import type { Dependency, Task, TaskId } from "../../modules/gantt/gantt.types";
import { computeCriticalPath } from "../../modules/gantt/gantt.critical-path";

export function useCriticalPath(opts: {
  tasks: Task[];
  dependencies: Dependency[];
  enabled: boolean;
}): Set<TaskId> {
  return useMemo(() => computeCriticalPath(opts), [opts.tasks, opts.dependencies, opts.enabled]);
}
