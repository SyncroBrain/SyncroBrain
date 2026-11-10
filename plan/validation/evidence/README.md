# Multi-vertical release evidence

Date: 2026-11-10

## L1

- `pnpm test:l1` → exit 0 (no live ThingsBoard)
- `pnpm --dir iot-gateway test:unit` **314** passed
- `pnpm --dir iot-gateway test:api` **85** passed (incl. packs-golden alarm+ack, device RPC safety)
- `pnpm --dir iot-console-web test` **71** passed
- EdgeAgent kits/scenes + protocols (L1 subset) **15** passed; full `pnpm --dir iot-edge-agent test` **31** passed (outbox HTTP client)
- `node tooling/scripts/contract-test.mjs` + pack locale keys

Machine-readable: `l1-summary.json`.

## Isolated E2E

- `pnpm e2e:isolated` **32 passed / 0 skipped / 0 failed**, wrapper exit 0（含 production-packs ack、env-lab clear）

## AI

- Gateway `@luminaryworks/ai-client`; Console AI Workspace
- `AI_MODE=stub` → `stubComplete`; tools from model/stub text
- Autonomous chat / AI scenes require ActionPolicy; killSwitch fail-closed

## Domain kernel (release)

- Alarm create/simulate opens Incident; ack required before close
- Live telemetry → `applyPackPolicy` / scenes (`scene.enabled`)
- Command outbox: `GET /edge/commands` + receipt; Rejected → failed
- Device RPC cannot bypass Safety Kernel

## Pack Factory

- Ten first-wave packs installable; channels/validate/locale enforced
- Rule-chain stub renamed off erroneous `cold-lab`; rollback to prior `pack_applications`

## Hardware

Compatibility matrix brand column remains `—`. This evidence is `protocol-verified` only.

## Explicitly not claimed

Payment clearing, VPP, full TMS/WMS, vendor SKU “hardware-verified”, ten full industry TB Rule Chains, live OCPP/Modbus/OPC UA/GPS brokers.

## Fault drill

Not re-run this refresh; see prior drill checklist if needed.
