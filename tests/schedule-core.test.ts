import assert from "node:assert/strict";
import test from "node:test";

import { calculatePhase, getCurrentPeriod, listPeriods } from "../src/schedule-core.js";

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

test("listPeriods returns day periods", () => {
  const result = listPeriods({ schedule: sampleSchedule, dayName: "Monday" });
  assert.equal(result.count, 2);
});

test("getCurrentPeriod resolves active period", () => {
  const result = getCurrentPeriod({
    schedule: sampleSchedule,
    dayName: "Monday",
    now: "2026-09-07T08:10:00.000Z"
  });
  assert.equal(result.currentPeriod?.label, "P1");
});

test("calculatePhase resolves complete after final period", () => {
  const result = calculatePhase({
    schedule: sampleSchedule,
    dayName: "Monday",
    now: "2026-09-07T10:10:00.000Z"
  });
  assert.equal(result.phase, "complete");
});
