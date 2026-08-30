#!/usr/bin/env node
/**
 * L1 = unit + Fake TB API + OpenAPI contract checks. No live ThingsBoard.
 * Agent entry from MetaRepo root:
 *
 *   pnpm test:l1
 */
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const metaRoot = join(here, "../..");
const gatewayDir = join(metaRoot, "iot-gateway");
const consoleDir = join(metaRoot, "iot-console-web");

function nestedPnpmEnv(extra = {}) {
  const env = { ...process.env, ...extra };
  for (const key of Object.keys(env)) {
    if (
      key.startsWith("npm_config_") ||
      key.startsWith("npm_package_") ||
      key.startsWith("PNPM_") ||
      key === "npm_lifecycle_event" ||
      key === "npm_command"
    ) {
      delete env[key];
    }
  }
  return env;
}

function run(label, args, cwd) {
  console.log(`\n==> ${label}`);
  const result = spawnSync("pnpm", ["--ignore-workspace", ...args], {
    cwd,
    env: nestedPnpmEnv(),
    stdio: "inherit",
  });
  if ((result.status ?? 1) !== 0) {
    console.error(`${label} failed (${result.status})`);
    process.exit(result.status ?? 1);
  }
}

if (!existsSync(join(gatewayDir, "package.json")) || !existsSync(join(consoleDir, "package.json"))) {
  console.error("Clone child repos first: pnpm init:repos:required");
  process.exit(1);
}

run("iot-gateway unit", ["test:unit"], gatewayDir);
run("iot-gateway api (Fake TB)", ["test:api"], gatewayDir);
run("iot-console-web unit", ["test"], consoleDir);

console.log("\n==> contracts");
const contracts = spawnSync(process.execPath, [join(here, "contract-test.mjs")], {
  cwd: metaRoot,
  stdio: "inherit",
});
if ((contracts.status ?? 1) !== 0) process.exit(contracts.status ?? 1);

console.log("\nL1 passed (no live ThingsBoard).");
