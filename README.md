# kui-gantt

[![npm](https://img.shields.io/npm/v/@kuraykaraaslan/kui-gantt.svg)](https://www.npmjs.com/package/@kuraykaraaslan/kui-gantt)
[![license](https://img.shields.io/npm/l/@kuraykaraaslan/kui-gantt.svg)](./LICENSE)

A standalone Gantt chart / project scheduler built on **React 18/19**, **Zustand** and **Tailwind CSS v4**. Ships a framework-agnostic TypeScript core (`GanttEngine`) plus a batteries-included React subpath.

> **Status**: early-stage (`0.0.1`). Public API is unstable; expect breaking changes between patch versions until `0.1.0`.

---

## Features

- **WBS task tree** — nested groups with collapse/expand, group rollup bars, and milestones
- **Drag interactions** — move, resize-start, resize-end, and progress drag on task bars, snapped to working days
- **Dependency arrows** — `FS`/`SS`/`FF`/`SF` links with optional lag; draw new links by dragging between tasks
- **Critical path** — longest-path computation with critical-task highlighting
- **Baseline ghosts** — overlay a planned baseline behind actual task bars
- **Resource conflict detection** — flag overlapping assignments per owner
- **Multi-scale timeline** — day / week / month / quarter / year zoom
- **Working days + holidays** shading via a non-working-days layer
- **Export** — PNG (SVG snapshot → canvas), PDF (print), and CSV
- **i18n** — overridable messages, `today` line, keyboard navigation, reduced-motion support
- Framework-agnostic core: Zustand vanilla store, no React imports below `react/`
- Strict TypeScript throughout

---

## Install

```bash
pnpm add @kuraykaraaslan/kui-gantt react react-dom zustand
```

`react`, `react-dom` and `zustand` are **peerDependencies**. `react`/`react-dom` are marked optional so the vanilla core can be consumed without React.

---

## Quick start — React

```tsx
import { Gantt } from "@kuraykaraaslan/kui-gantt/react";
import type { Task, Dependency } from "@kuraykaraaslan/kui-gantt";
import "@kuraykaraaslan/kui-gantt/styles.css";

const tasks: Task[] = [
  { id: "g1", name: "Phase 1", start: new Date(2026, 5, 1), end: new Date(2026, 5, 20), isGroup: true },
  { id: "t1", name: "Design",  start: new Date(2026, 5, 1), end: new Date(2026, 5, 8),  parentId: "g1", progress: 100, owner: "Ada" },
  { id: "t2", name: "Build",   start: new Date(2026, 5, 9), end: new Date(2026, 5, 18), parentId: "g1", progress: 40,  owner: "Lin" },
  { id: "m1", name: "Launch",  start: new Date(2026, 5, 20), end: new Date(2026, 5, 20), isMilestone: true },
];

const dependencies: Dependency[] = [
  { id: "d1", from: "t1", to: "t2", type: "FS" },
  { id: "d2", from: "t2", to: "m1", type: "FS" },
];

export default function App() {
  return (
    <div className="h-screen">
      <Gantt
        tasks={tasks}
        dependencies={dependencies}
        scale="week"
        criticalPath
        workingDays={[1, 2, 3, 4, 5]}
        exportFormats={["png", "pdf", "csv"]}
        onTaskUpdate={(task) => console.log("update", task)}
        onDependencyCreate={(dep) => console.log("link", dep)}
        onDependencyDelete={(id) => console.log("unlink", id)}
      />
    </div>
  );
}
```

Import `styles.css` **once** at your app root — it ships the compiled Tailwind v4 design tokens the component depends on.

---

## Quick start — vanilla TypeScript

The `GanttEngine` holds the Zustand vanilla store with no React dependency — mirroring the role of the `Viewer` class in [`@kuraykaraaslan/kui-viewer`](https://www.npmjs.com/package/@kuraykaraaslan/kui-viewer).

```ts
import { GanttEngine, computeCriticalPath, computeTimelineScale } from "@kuraykaraaslan/kui-gantt";

const engine = new GanttEngine({ tasks, dependencies, scale: "week", criticalPath: true });

engine.setScale("month");
engine.setCriticalPath(true);

// subscribe to store changes
const unsub = engine.store.subscribe((s) => console.log(s.scale));

// pure helpers usable without the engine
const critical = computeCriticalPath(tasks, dependencies);
const scale = computeTimelineScale(tasks, "week");

engine.dispose();
unsub();
```

---

## Dependencies

Each link is typed and may carry a lag in days:

```ts
{ id: "d1", from: "t1", to: "t2", type: "FS", lag: 2 }  // finish-to-start, +2 days
```

Supported types: `FS` (finish→start), `SS` (start→start), `FF` (finish→finish), `SF` (start→finish).

---

## API — `<Gantt />`

| Prop | Type | Notes |
|---|---|---|
| `tasks` | `Task[]` | required |
| `dependencies` | `Dependency[]` | link arrows |
| `baselines` | `Baseline[]` | planned ghost bars |
| `scale` | `'day' \| 'week' \| 'month' \| 'quarter' \| 'year'` | timeline zoom |
| `workingDays` | `number[]` | 0–6 (Sun–Sat); others shaded as non-working |
| `holidays` | `Date[]` | extra non-working days |
| `criticalPath` | `boolean` | compute + highlight the critical path |
| `exportFormats` | `('png' \| 'pdf' \| 'csv')[]` | enable the export menu |
| `onTaskUpdate` | `(task) => void \| Promise` | fired on drag commit |
| `onDependencyCreate` / `onDependencyDelete` | callbacks | link editing |
| `messages` | `Partial<GanttMessages>` | string overrides |
| `locale` | `string` | locale code |
| `reducedMotion` | `boolean` | disable transitions |
| `onTelemetry` | `(e: GanttTelemetry) => void` | unified event stream |
| `ariaLabel` / `className` | `string` | root element |

---

## Exports

| Specifier | Contents |
|---|---|
| `@kuraykaraaslan/kui-gantt` | Vanilla core: `GanttEngine`, `createGanttStore`, timeline + critical-path + resource-conflict helpers, constants, and all types |
| `@kuraykaraaslan/kui-gantt/react` | React `<Gantt />` plus hooks (`useGanttEngine`, `useGanttStore`, `useTimelineScale`, `useCriticalPath`, `useResourceConflicts`, `useExport`) |
| `@kuraykaraaslan/kui-gantt/styles.css` | Compiled Tailwind v4 tokens. Import once at the app root |

---

## Stack

- [React](https://react.dev/) 18 / 19 (peer)
- [Zustand](https://github.com/pmndrs/zustand) v5 (vanilla store)
- [Tailwind CSS](https://tailwindcss.com/) v4 (design tokens)
- [Font Awesome](https://fontawesome.com/) (toolbar / control icons)
- [`clsx`](https://github.com/lukeed/clsx) + [`tailwind-merge`](https://github.com/dcastil/tailwind-merge) (`cn()` helper)

---

## Development

```bash
pnpm install
pnpm dev          # Vite playground at http://localhost:5173
pnpm build        # JS + .d.ts + styles.css → dist/
```

---

## Project layout

- `modules/` — vanilla core (engine, store, timeline, critical-path, resource-conflicts, types). No React imports.
- `react/` — React subpath: `<Gantt />`, parts (bars, arrows, layers, toolbar), and hooks.
- `libs/` — cross-cutting utilities (`cn()`).
- `src/` — Vite dev playground (not bundled into the published package).
- `scripts/` — build helpers (`build-css.mjs`).

---

## License

[Apache-2.0](./LICENSE) © 2026 Kuray Karaaslan
