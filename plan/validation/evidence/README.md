# Multi-vertical release evidence

Date: 2026-08-31

## L1

- `pnpm --dir iot-gateway test:unit` 43 passed
- `pnpm --dir iot-gateway test:api` 16 passed (pack golden + Incident ack/close + duty/channels/report export)
- `pnpm --dir iot-console-web test` 39 passed
- EdgeAgent `node --test iot-edge-agent/test/protocols.test.mjs` (7 passed, includes outbox consume)
- `node tooling/scripts/contract-test.mjs`

Machine-readable: `l1-summary.json`.

## Isolated E2E

- `pnpm e2e:isolated` **14 passed**, wrapper exit 0（cold-lab / env-lab + 五个新垂直 Pack）

## AI

- Gateway `@luminaryworks/ai-client@0.2.1`; Console `@luminaryworks/ai-react@0.1.1` ModelForm
- CI / `NODE_ENV=test` / `AI_STUB=true` remain deterministic stubs
- Safety kernel: injection, SQL/RPC, kill switch, range, idempotent ping

## Domain kernel (release)

- Alarm create/simulate opens Incident (`drill=true` for simulate)
- Ack → close; close while `open` is rejected
- Duty roster seeded on demo; calibration + compliance CSV export
- Command outbox: Fake TB inlines Edge; live path is `GET /edge/commands` + receipt

## Hardware

Compatibility matrix brand column remains `—`. This evidence is `protocol-verified` only.

## Explicitly not claimed

Payment clearing, VPP, full TMS/WMS, vendor SKU “hardware-verified”.
