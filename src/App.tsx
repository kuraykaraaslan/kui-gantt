import { useState } from "react";
import { Gantt } from "../react/Gantt";
import type { Task, Dependency } from "../modules/gantt/gantt.types";

const today = new Date();
const d = (offset: number) => new Date(today.getTime() + offset * 86400000);

const TASKS: Task[] = [
  { id: "t1", name: "Project Kickoff", start: d(0),  end: d(1),  progress: 100, isGroup: false },
  { id: "t2", name: "Planning",        start: d(1),  end: d(7),  progress: 80,  isGroup: true  },
  { id: "t3", name: "Requirements",    start: d(1),  end: d(4),  progress: 100, parentId: "t2", isGroup: false },
  { id: "t4", name: "Architecture",    start: d(4),  end: d(7),  progress: 60,  parentId: "t2", isGroup: false },
  { id: "t5", name: "Development",     start: d(7),  end: d(21), progress: 30,  isGroup: true  },
  { id: "t6", name: "Frontend",        start: d(7),  end: d(16), progress: 40,  parentId: "t5", owner: "Alice", isGroup: false },
  { id: "t7", name: "Backend",         start: d(7),  end: d(18), progress: 25,  parentId: "t5", owner: "Bob",   isGroup: false },
  { id: "t8", name: "Testing",         start: d(18), end: d(24), progress: 0,   isGroup: false },
  { id: "t9", name: "Launch",          start: d(24), end: d(24), progress: 0,   isMilestone: true, isGroup: false },
];

const DEPS: Dependency[] = [
  { id: "d1", from: "t1", to: "t2", type: "FS" },
  { id: "d2", from: "t2", to: "t5", type: "FS" },
  { id: "d3", from: "t5", to: "t8", type: "FS" },
  { id: "d4", from: "t8", to: "t9", type: "FS" },
];

export function App() {
  const [tasks, setTasks] = useState<Task[]>(TASKS);

  const handleTaskUpdate = (updated: Task) => {
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 600 }}>KUI Gantt Dev Playground</h1>
      <Gantt
        tasks={tasks}
        dependencies={DEPS}
        showCriticalPath={true}
        exportFormats={["csv", "pdf", "png"]}
        onTaskUpdate={handleTaskUpdate}
      />
    </div>
  );
}
