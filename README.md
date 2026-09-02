# Otto Schedule Resolver Extension

This repository provides reusable schedule period resolution and phase calculation logic for Otto workflows.

All command behavior is internal and routed through the Otto Command Service Layer.

## Responsibilities
- Register internal schedule commands through the command-service layer.
- Resolve current and next periods from schedule definitions.
- Calculate schedule phase state for active/upcoming/ended periods.
- Keep schedule logic deterministic and framework-agnostic.

## Command Contracts
- `schedule.get.current`
- `schedule.list.periods`
- `schedule.calculate.phase`

## Repository Layout
- `src/features/schedule/schedule-core.ts`: Schedule loading and phase engine logic.
- `src/schedule-core.ts`: Typed exports for extension consumers.
- `src/schedule-commands.ts`: Internal in-process command registration.
- `src/schedule-runtime.mjs`: Runtime-safe bridge used by command-service handlers.
- `manifests/extension.json`: Extension metadata consumed by Otto extension registry.
- `tests/*.test.ts`: Node test coverage for command behavior.

## How It Wires Into Otto
1. Register command schemas in `otto-command-service/src/schemas`.
2. Register command handlers in `otto-command-service/src/handlers`.
3. Point handlers to `src/schedule-runtime.mjs` in this repo.
4. Call schedule commands through routed command execution only.

## Local Development
1. Install dependencies: `pnpm --filter otto-schedule-resolver-extension install`
2. Run tests: `pnpm --filter otto-schedule-resolver-extension test`
3. Run typecheck: `pnpm --filter otto-schedule-resolver-extension typecheck`

## Design Constraints
- Never expose API routes or CLI argument parsing in this repo.
- Keep schedule payload contracts deterministic and schema-friendly.
- Keep business logic DRY and feature-scoped.

## Validation
- `npm run test`
- `npm run typecheck`
