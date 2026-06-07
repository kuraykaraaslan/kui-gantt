import { diffDays } from "../../modules/gantt/gantt.timeline";

type TodayLineProps = {
  rangeStart: Date;
  rangeEnd: Date;
  pixelsPerDay: number;
  totalHeight: number;
};

export function TodayLine({ rangeStart, rangeEnd, pixelsPerDay, totalHeight }: TodayLineProps) {
  const today = new Date();
  if (today < rangeStart || today > rangeEnd) return null;
  const left = diffDays(rangeStart, today) * pixelsPerDay;
  return (
    <div
      aria-hidden="true"
      className="gantt-today-line absolute top-0 pointer-events-none z-10"
      style={{ left, height: totalHeight, width: 2, backgroundColor: "var(--warning)" }}
    />
  );
}
