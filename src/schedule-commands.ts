import {
  calculatePhase,
  getCurrentPeriod,
  listPeriods,
  type ScheduleCalculatePhaseInput,
  type ScheduleGetCurrentInput,
  type ScheduleListPeriodsInput
} from "./schedule-core.js";
import { commandService } from "./command-service.js";

export const SCHEDULE_GET_CURRENT_COMMAND_ID = "schedule.get.current";
export const SCHEDULE_LIST_PERIODS_COMMAND_ID = "schedule.list.periods";
export const SCHEDULE_CALCULATE_PHASE_COMMAND_ID = "schedule.calculate.phase";

commandService.register(SCHEDULE_GET_CURRENT_COMMAND_ID, async (input: ScheduleGetCurrentInput) => getCurrentPeriod(input));
commandService.register(SCHEDULE_LIST_PERIODS_COMMAND_ID, async (input: ScheduleListPeriodsInput) => listPeriods(input));
commandService.register(SCHEDULE_CALCULATE_PHASE_COMMAND_ID, async (input: ScheduleCalculatePhaseInput) => calculatePhase(input));

export async function executeScheduleCommand<TInput, TOutput>(commandName: string, input: TInput): Promise<TOutput> {
  return commandService.run<TInput, TOutput>(commandName, input);
}
