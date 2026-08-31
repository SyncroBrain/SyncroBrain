#!/usr/bin/env node
/**
 * Isolated Playwright: Gateway TB_MODE=fake + sqlite, no ThingsBoard CE.
 * Never skip. Fails if Playwright reports skipped live specs.
 *
 *   pnpm e2e:isolated
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { waitForHttpOk } from "./lib/wait-port.mjs";

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

if (!existsSync(join(gatewayDir, "package.json")) || !existsSync(join(consoleDir, "package.json"))) {
  console.error("Clone child repos first: pnpm init:repos:required");
  process.exit(1);
}

const dbPath = join(mkdtempSync(join(tmpdir(), "sb-e2e-")), "isolated.sqlite");
const children = [];

function spawnInherit(command, args, cwd, extraEnv) {
  const child = spawn(command, args, {
    cwd,
    env: nestedPnpmEnv(extraEnv),
    stdio: "inherit",
    detached: true,
  });
  children.push(child);
  return child;
}

function shutdown() {
  for (const child of children) {
    if (!child.pid) continue;
    try {
      process.kill(child.pid, "SIGTERM");
    } catch {
      /* already exited */
    }
  }
  rmSync(dirname(dbPath), { recursive: true, force: true });
}

process.on("SIGINT", () => {
  shutdown();
  process.exit(130);
});

console.log("Building gateway for Fake TB…");
const built = spawnSync("pnpm", ["--ignore-workspace", "build"], {
  cwd: gatewayDir,
  env: nestedPnpmEnv(),
  stdio: "inherit",
});
if ((built.status ?? 1) !== 0) process.exit(built.status ?? 1);

spawnInherit("node", ["dist/main"], gatewayDir, {
  TB_MODE: "fake",
  DB_TYPE: "sqlite",
  DB_PATH: dbPath,
  DB_DROP_SCHEMA: "true",
  MQTT_ENABLED: "false",
  CASBIN_DEV_OPEN: "true",
  JWT_SECRET: "dev-iot-jwt-fallback",
  TB_PASSWORD: "sysadmin",
  DB_PASSWORD: "iot_dev_password",
  LICENSE_ALLOW_DEV: "true",
  PORT: "13200",
  NODE_ENV: "test",
});

spawnInherit("pnpm", ["--ignore-workspace", "dev"], consoleDir, {
  VITE_ALLOW_LOCAL_LOGIN: "true",
  VITE_API_PROXY_TARGET: "http://127.0.0.1:13200",
});

const gatewayOk = await waitForHttpOk("http://127.0.0.1:13200/api/v1/health", 60_000);
if (!gatewayOk) {
  console.error("Gateway Fake TB did not become healthy");
  process.exit(1);
}
const consoleOk = await waitForHttpOk("http://127.0.0.1:15180", 90_000);
if (!consoleOk) {
  console.error("Console did not become ready");
  process.exit(1);
}

const e2e = spawnSync("pnpm", ["--ignore-workspace", "e2e"], {
  cwd: consoleDir,
  env: nestedPnpmEnv({
    E2E_ISOLATED: "1",
    E2E_REQUIRE_STACK: "1",
    E2E_BASE_URL: "http://127.0.0.1:15180",
  }),
  stdio: "inherit",
});

const reportPath = join(consoleDir, "test-results/e2e-results.json");
let code = e2e.status ?? 1;
if (existsSync(reportPath)) {
  const { readFileSync } = await import("node:fs");
  const report = JSON.parse(readFileSync(reportPath, "utf8"));
  const stats = report.stats ?? {};
  if ((stats.skipped ?? 0) > 0) {
    console.error("Isolated e2e reported skipped tests; refusing false green.");
    code = 1;
  } else if ((stats.expected ?? 0) === 0 && (stats.unexpected ?? 0) === 0) {
    console.error("Isolated e2e ran zero tests; refusing false green.");
    code = 1;
  }
}
shutdown();
process.exit(code);
