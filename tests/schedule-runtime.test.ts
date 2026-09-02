import assert from "node:assert/strict";
import test from "node:test";

const sampleSchedule = {
  days: [
    {
      name: "Monday",
      periods: [
        { label: "P1", startsAt: "2026-09-07T08:00:00.000Z", endsAt: "2026-09-07T08:45:00.000Z" },
        { label: "P2", startsAt: "2026-09-07T09:00:00.000Z", endsAt: "2026-09-07T09:45:00.000Z" }
      ]
    }
  ]
};

test("schedule.get.current returns current and next periods", async () => {
  const { executeScheduleCommand } = await import("../src/schedule-runtime.mjs");
  const result = await executeScheduleCommand("schedule.get.current", {
    schedule: sampleSchedule,
    dayName: "Monday",
    now: "2026-09-07T08:10:00.000Z"
  });

  assert.equal(result.currentPeriod?.label, "P1");
  assert.equal(result.nextPeriod?.label, "P2");
});

test("schedule.calculate.phase returns between when between periods", async () => {
  const { executeScheduleCommand } = await import("../src/schedule-runtime.mjs");
  const result = await executeScheduleCommand("schedule.calculate.phase", {
    schedule: sampleSchedule,
    dayName: "Monday",
    now: "2026-09-07T08:50:00.000Z"
  });

  assert.equal(result.phase, "between");
});

test("schedule.list.periods returns periods for selected day", async () => {
  const { executeScheduleCommand } = await import("../src/schedule-runtime.mjs");
  const result = await executeScheduleCommand("schedule.list.periods", {
    schedule: sampleSchedule,
    dayName: "Monday"
  });

  assert.equal(result.count, 2);
});
