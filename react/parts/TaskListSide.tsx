import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronDown, faDiamond, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { cn } from "../../libs/utils/cn.js";
import type { Task, TaskId, GanttMessages } from "../../modules/gantt/gantt.types.js";
import { ROW_HEIGHT, SIDE_PANEL_WIDTH } from "../../modules/gantt/gantt.types.js";

type FlatRow = { task: Task; depth: number; hasChildren: boolean };

type TaskListSideProps = {
  flatRows: FlatRow[];
  collapsed: Set<TaskId>;
  onToggleCollapse: (id: TaskId) => void;
  messages: GanttMessages;
  totalHeight: number;
  conflictSet?: Set<TaskId>;
};

export function TaskListSide({ flatRows, collapsed, onToggleCollapse, messages, totalHeight, conflictSet }: TaskListSideProps) {
  return (
    <div className="gantt-task-side shrink-0 border-r border-border bg-surface-base" style={{ width: SIDE_PANEL_WIDTH }}>
      <div role="row" aria-rowindex={1} className="flex h-12 items-center px-3 border-b border-border bg-surface-raised text-xs font-semibold text-text-secondary uppercase tracking-wide">
        <span className="flex-1 truncate">{messages.taskColumn}</span>
        <span className="w-24 truncate">{messages.ownerColumn}</span>
        <span className="w-10 text-right tabular-nums">{messages.progressColumn}</span>
      </div>
      <div style={{ minHeight: totalHeight }}>
        {flatRows.map((row, i) => {
          const { task, depth, hasChildren } = row;
          const isCollapsed = collapsed.has(task.id);
          const progress = Math.max(0, Math.min(100, task.progress ?? 0));
          return (
            <div
              key={task.id}
              role="row"
              aria-rowindex={i + 2}
              className={cn("flex items-center px-3 border-b border-border/60 text-sm hover:bg-surface-overlay transition-colors")}
              style={{ height: ROW_HEIGHT }}
            >
              <div className="flex items-center flex-1 min-w-0" style={{ paddingLeft: depth * 16 }}>
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => onToggleCollapse(task.id)}
                    aria-expanded={!isCollapsed}
                    aria-label={isCollapsed ? `Expand ${task.name}` : `Collapse ${task.name}`}
                    className="inline-flex items-center justify-center w-5 h-5 mr-1 rounded text-text-secondary hover:text-text-primary hover:bg-surface-overlay focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                  >
                    <FontAwesomeIcon icon={isCollapsed ? faChevronRight : faChevronDown} className="w-3 h-3" aria-hidden="true" />
                  </button>
                ) : (
                  <span className="inline-block w-5 mr-1" aria-hidden="true" />
                )}
                {task.isMilestone && (
                  <FontAwesomeIcon icon={faDiamond} className="w-2.5 h-2.5 mr-1.5 rotate-45 text-primary" aria-hidden="true" />
                )}
                <span className={cn("truncate", task.isGroup ? "font-semibold text-text-primary" : "text-text-primary")} title={task.name}>
                  {task.name}
                </span>
              </div>
              <span
                className={cn("w-24 truncate text-xs flex items-center gap-1", conflictSet?.has(task.id) ? "text-error" : "text-text-secondary")}
                title={conflictSet?.has(task.id) ? `${task.owner ?? ""} — over-allocated` : task.owner ?? ""}
              >
                {conflictSet?.has(task.id) && <FontAwesomeIcon icon={faTriangleExclamation} className="w-3 h-3 shrink-0" aria-hidden="true" />}
                <span className="truncate">{task.owner ?? "—"}</span>
              </span>
              <span className="w-10 text-right text-xs tabular-nums text-text-secondary">{progress}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
