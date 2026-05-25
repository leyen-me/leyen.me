"use client";

import { cn } from "@/lib/utils";

type DailyLog = {
  date: string;
  activityLevel: number;
};

type EnglishHeatmapProps = {
  logs: DailyLog[];
  className?: string;
};

const LEVEL_COLORS = [
  "bg-zinc-100 dark:bg-zinc-800",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-400 dark:bg-emerald-700",
  "bg-emerald-500 dark:bg-emerald-600",
  "bg-emerald-600 dark:bg-emerald-500",
];

function buildWeeks(logs: DailyLog[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const log of logs) {
    map.set(log.date, log.activityLevel);
  }
  return map;
}

function getDays(count: number): string[] {
  const days: string[] = [];
  const end = new Date();
  end.setHours(12, 0, 0, 0);
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

export default function EnglishHeatmap({ logs, className }: EnglishHeatmapProps) {
  const activityMap = buildWeeks(logs);
  const days = getDays(365);
  const weeks: string[][] = [];
  let currentWeek: string[] = [];

  for (const date of days) {
    const dayOfWeek = new Date(`${date}T12:00:00`).getDay();
    if (currentWeek.length === 0 && dayOfWeek !== 0) {
      for (let i = 0; i < dayOfWeek; i += 1) {
        currentWeek.push("");
      }
    }
    currentWeek.push(date);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length) weeks.push(currentWeek);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-x-auto">
        <div className="inline-flex gap-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {week.map((date, di) => {
                if (!date) {
                  return (
                    <div
                      key={`${wi}-${di}`}
                      className="h-3 w-3 rounded-sm bg-transparent"
                    />
                  );
                }
                const level = activityMap.get(date) ?? 0;
                return (
                  <div
                    key={date}
                    title={`${date}: 活跃度 ${level}`}
                    className={cn("h-3 w-3 rounded-sm", LEVEL_COLORS[level] ?? LEVEL_COLORS[0])}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        <span>少</span>
        {LEVEL_COLORS.map((color, i) => (
          <div key={i} className={cn("h-3 w-3 rounded-sm", color)} />
        ))}
        <span>多</span>
      </div>
    </div>
  );
}
