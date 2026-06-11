import { useState } from "react";
import { Gantt } from "../react/Gantt";
import type { Task, Dependency } from "../modules/gantt/gantt.types";
import DemoShell from "./DemoShell";

const today = new Date();
const d = (offset: number) => new Date(today.getTime() + offset * 86400000);

const TASKS: Task[] = [
  { id: "t1", name: "Project Kickoff", start: d(0), end: d(1), progress: 100, isGroup: false },
  { id: "t2", name: "Planning", start: d(1), end: d(7), progress: 80, isGroup: true },
  { id: "t3", name: "Requirements", start: d(1), end: d(4), progress: 100, parentId: "t2", isGroup: false },
  { id: "t4", name: "Architecture", start: d(4), end: d(7), progress: 60, parentId: "t2", isGroup: false },
  { id: "t5", name: "Development", start: d(7), end: d(21), progress: 30, isGroup: true },
  { id: "t6", name: "Frontend", start: d(7), end: d(16), progress: 40, parentId: "t5", owner: "Alice", isGroup: false },
  { id: "t7", name: "Backend", start: d(7), end: d(18), progress: 25, parentId: "t5", owner: "Bob", isGroup: false },
  { id: "t8", name: "Testing", start: d(18), end: d(24), progress: 0, isGroup: false },
  { id: "t9", name: "Launch", start: d(24), end: d(24), progress: 0, isMilestone: true, isGroup: false },
];

const DEPS: Dependency[] = [
  { id: "d1", from: "t1", to: "t2", type: "FS" },
  { id: "d2", from: "t2", to: "t5", type: "FS" },
  { id: "d3", from: "t5", to: "t8", type: "FS" },
  { id: "d4", from: "t8", to: "t9", type: "FS" },
];

const LEGEND: { color: string; label: string }[] = [
  { color: "bg-primary", label: "Task bar" },
  { color: "bg-secondary", label: "Group / summary" },
  { color: "bg-warning", label: "Milestone" },
  { color: "bg-error", label: "Critical path" },
];

export function App() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [showCriticalPath, setShowCriticalPath] = useState(true);

  const handleTaskUpdate = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const milestones = tasks.filter((t) => t.isMilestone).length;
  const avgProgress = Math.round(tasks.reduce((s, t) => s + (t.progress ?? 0), 0) / tasks.length);

  const sidebar = (
    <div className="flex flex-col gap-5">
      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Options</div>
        <button
          type="button"
          onClick={() => setShowCriticalPath((v) => !v)}
          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-[13px] font-medium transition-colors ${
            showCriticalPath ? "bg-primary-subtle text-primary" : "text-text-primary hover:bg-surface-overlay"
          }`}
        >
          Critical path
          <span
            className={`relative h-4 w-7 rounded-full transition-colors ${
              showCriticalPath ? "bg-primary" : "bg-surface-overlay"
            }`}
          >
            <span
              className={`absolute top-0.5 h-3 w-3 rounded-full bg-white transition-all ${
                showCriticalPath ? "left-3.5" : "left-0.5"
              }`}
            />
          </span>
        </button>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Summary</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { k: "Tasks", v: tasks.length },
            { k: "Links", v: DEPS.length },
            { k: "Milestones", v: milestones },
            { k: "Progress", v: `${avgProgress}%` },
          ].map((s) => (
            <div key={s.k} className="rounded-lg border border-border bg-surface-base p-2.5">
              <div className="font-mono text-base font-semibold text-text-primary">{s.v}</div>
              <div className="text-[11px] text-text-secondary">{s.k}</div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">Legend</div>
        <div className="flex flex-col gap-2">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-2.5 text-[12.5px] text-text-secondary">
              <span className={`h-2.5 w-2.5 rounded-sm ${l.color}`} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <DemoShell
      brand="KUI Gantt"
      version="v0.0.1"
      link={{ href: "https://kuray.dev", label: "kuray.dev" }}
      github="https://github.com/kuraykaraaslan/kui-gantt"
      npm="https://www.npmjs.com/package/@kuraykaraaslan/kui-gantt"
      sidebarTitle="Project"
      sidebarCount={`${tasks.length} tasks`}
      sidebar={sidebar}
      status={{
        tone: "ready",
        text: `${tasks.length} tasks · ${DEPS.length} dependencies`,
        meta: `${avgProgress}% complete`,
      }}
      stageClassName="p-4"
    >
      <Gantt
        tasks={tasks}
        dependencies={DEPS}
        criticalPath={showCriticalPath}
        exportFormats={["csv", "pdf", "png"]}
        onTaskUpdate={handleTaskUpdate}
      />
    </DemoShell>
  );
}
