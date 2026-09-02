function resolveDay(schedule, dayName) {
  const days = Array.isArray(schedule?.days) ? schedule.days : [];
  if (days.length === 0) {
    throw new Error("schedule.days is required");
  }

  if (dayName) {
    const match = days.find((day) => String(day.name || "").toLowerCase() === String(dayName).toLowerCase());
    if (!match) {
      throw new Error(`Unknown day: ${dayName}`);
    }
    return match;
  }

  return days[0];
}

function resolveNow(now) {
  if (!now) {
    return new Date();
  }

  const value = new Date(now);
  if (Number.isNaN(value.getTime())) {
    throw new Error(`Invalid now timestamp: ${now}`);
  }

  return value;
}

function getCurrentPeriod(now, day) {
  for (const period of day.periods || []) {
    const start = new Date(period.startsAt).getTime();
    const end = new Date(period.endsAt).getTime();
    const ts = now.getTime();
    if (ts >= start && ts < end) {
      return period;
    }
  }

  return null;
}

function getNextPeriod(now, day) {
  return (day.periods || []).find((period) => new Date(period.startsAt).getTime() > now.getTime()) || null;
}

function listPeriodsCommand(input = {}) {
  const day = resolveDay(input.schedule, input.dayName);
  return {
    dayName: day.name,
    periods: Array.isArray(day.periods) ? day.periods : [],
    count: Array.isArray(day.periods) ? day.periods.length : 0
  };
}

function getCurrentCommand(input = {}) {
  const day = resolveDay(input.schedule, input.dayName);
  const now = resolveNow(input.now);
  const currentPeriod = getCurrentPeriod(now, day);
  const nextPeriod = getNextPeriod(now, day);
  return {
    dayName: day.name,
    now: now.toISOString(),
    currentPeriod,
    nextPeriod
  };
}

function calculatePhaseCommand(input = {}) {
  const day = resolveDay(input.schedule, input.dayName);
  const now = resolveNow(input.now);
  const currentPeriod = getCurrentPeriod(now, day);
  const nextPeriod = getNextPeriod(now, day);

  let phase = "idle";
  if (currentPeriod) {
    phase = "active";
  } else if (nextPeriod) {
    phase = (day.periods || []).length > 0 ? "between" : "idle";
  } else if ((day.periods || []).length > 0) {
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

export async function executeScheduleCommand(commandName, input = {}) {
  switch (commandName) {
    case "schedule.get.current":
      return getCurrentCommand(input);
    case "schedule.list.periods":
      return listPeriodsCommand(input);
    case "schedule.calculate.phase":
      return calculatePhaseCommand(input);
    default:
      throw new Error(`Unknown schedule command: ${commandName}`);
  }
}
