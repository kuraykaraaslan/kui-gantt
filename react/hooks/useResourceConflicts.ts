import { useMemo } from "react";
import type { Task, TaskId } from "../../modules/gantt/gantt.types";
import { computeResourceConflicts } from "../../modules/gantt/gantt.resource-conflicts";

export function useResourceConflicts(tasks: Task[]): Set<TaskId> {
  return useMemo(() => computeResourceConflicts(tasks), [tasks]);
}
