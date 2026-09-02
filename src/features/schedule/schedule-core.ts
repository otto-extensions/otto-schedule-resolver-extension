import { promises as fs } from "node:fs";

export interface SchedulePeriod {
  label: string;
  startsAt: string;
  endsAt: string;
}

export interface ScheduleDay {
  name: string;
  periods: SchedulePeriod[];
}

export interface DisplaySchedule {
  days: ScheduleDay[];
}

export interface ScheduleGetCurrentInput {
  schedule: DisplaySchedule;
  dayName?: string;
  now?: string;
}

export interface ScheduleListPeriodsInput {
  schedule: DisplaySchedule;
  dayName?: string;
}

export interface ScheduleCalculatePhaseInput {
  schedule: DisplaySchedule;
  dayName?: string;
  now?: string;
}

export class SchedulePhaseEngine {
  getCurrentPeriod(now: Date, day: ScheduleDay): SchedulePeriod | null {
    for (const period of day.periods) {
      const start = new Date(period.startsAt).getTime();
      const end = new Date(period.endsAt).getTime();
      const ts = now.getTime();
      if (ts >= start && ts < end) {
        return period;
      }
    }

    return null;
  }

  getNextPeriod(now: Date, day: ScheduleDay): SchedulePeriod | null {
    return day.periods.find((period) => new Date(period.startsAt).getTime() > now.getTime()) ?? null;
  }
}

export async function loadSchedule(pathToSchedule: string): Promise<DisplaySchedule> {
  const raw = await fs.readFile(pathToSchedule, "utf8");
  return JSON.parse(raw) as DisplaySchedule;
}

function resolveDay(schedule: DisplaySchedule, dayName?: string): ScheduleDay {
  const days = Array.isArray(schedule?.days) ? schedule.days : [];
  if (days.length === 0) {
    throw new Error("schedule.days is required");
  }

  if (dayName) {
    const match = days.find((day) => day.name.toLowerCase() === dayName.toLowerCase());
    if (!match) {
      throw new Error(`Unknown day: ${dayName}`);
    }

    return match;
  }

  return days[0];
}

function resolveNow(now?: string): Date {
  if (!now) {
    return new Date();
  }

  const value = new Date(now);
  if (Number.isNaN(value.getTime())) {
    throw new Error(`Invalid now timestamp: ${now}`);
  }

  return value;
}

export function listPeriods(input: ScheduleListPeriodsInput): { dayName: string; periods: SchedulePeriod[]; count: number } {
  const day = resolveDay(input.schedule, input.dayName);
  return {
    dayName: day.name,
    periods: day.periods,
    count: day.periods.length
  };
}

export function getCurrentPeriod(input: ScheduleGetCurrentInput): {
  dayName: string;
  now: string;
  currentPeriod: SchedulePeriod | null;
  nextPeriod: SchedulePeriod | null;
} {
  const day = resolveDay(input.schedule, input.dayName);
  const now = resolveNow(input.now);
  const engine = new SchedulePhaseEngine();
  return {
    dayName: day.name,
    now: now.toISOString(),
    currentPeriod: engine.getCurrentPeriod(now, day),
    nextPeriod: engine.getNextPeriod(now, day)
  };
}

export function calculatePhase(input: ScheduleCalculatePhaseInput): {
  dayName: string;
  now: string;
  phase: "idle" | "active" | "between" | "complete";
  currentPeriod: SchedulePeriod | null;
  nextPeriod: SchedulePeriod | null;
} {
  const day = resolveDay(input.schedule, input.dayName);
  const now = resolveNow(input.now);
  const engine = new SchedulePhaseEngine();
  const currentPeriod = engine.getCurrentPeriod(now, day);
  const nextPeriod = engine.getNextPeriod(now, day);

  let phase: "idle" | "active" | "between" | "complete" = "idle";
  if (currentPeriod) {
    phase = "active";
  } else if (nextPeriod) {
    phase = day.periods.length > 0 ? "between" : "idle";
  } else if (day.periods.length > 0) {
    const last = day.periods[day.periods.length - 1];
    const lastEnd = new Date(last.endsAt).getTime();
    phase = now.getTime() >= lastEnd ? "complete" : "idle";
  }

  return {
    dayName: day.name,
    now: now.toISOString(),
    phase,
    currentPeriod,
    nextPeriod
  };
}
