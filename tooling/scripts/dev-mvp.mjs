#!/usr/bin/env node
/**
 * Start iot-gateway + iot-console-web for local MVP dev.
 * Windows: delegates to dev-mvp.ps1 (separate terminal windows).
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { findMetaRoot } from "./lib/paths.mjs";
import { waitForHttpOk } from "./lib/wait-port.mjs";

const metaRoot = findMetaRoot();
if (!metaRoot) {
  console.error("❌ Run from SyncroBrain Meta-Repo root.");
  process.exit(1);
}

if (process.platform === "win32") {
  console.log("Windows: 使用 dev-mvp.ps1 启动独立窗口\n");
  const ps = spawnSync(
    "powershell",
    [
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      join(metaRoot, "dev-mvp.ps1"),
    ],
    { stdio: "inherit", cwd: metaRoot },
  );
  process.exit(ps.status ?? 1);
}

const gatewayDir = join(metaRoot, "iot-gateway");
const consoleDir = join(metaRoot, "iot-console-web");

for (const [label, dir] of [
  ["iot-gateway", gatewayDir],
  ["iot-console-web", consoleDir],
]) {
  if (!existsSync(join(dir, "package.json"))) {
    console.error(`❌ ${label} not found — run ./dev.sh first`);
    process.exit(1);
  }
}

const children = [];
const stopAll = () => {
  for (const c of children) {
    try {
      c.kill("SIGTERM");
    } catch {
      /* ignore */
    }
  }
};
process.on("SIGINT", () => {
  stopAll();
  process.exit(0);
});

start("iot-gateway", gatewayDir, ["pnpm", "dev"]);
console.log("⏳ Waiting for http://localhost:13200/api/v1/health ...");
if (!(await waitForHttpOk("http://127.0.0.1:13200/api/v1/health"))) {
  console.error("❌ Gateway not ready in 60s");
  stopAll();
  process.exit(1);
}
console.log("✅ Gateway ready");

start("iot-console-web", consoleDir, ["pnpm", "dev"]);

console.log(`
  Gateway  http://localhost:13200/api/v1/health
  Console  http://localhost:5180
  Ctrl+C to stop
`);

await new Promise(() => {});

function start(name, cwd, [cmd, ...args]) {
  console.log(`▶ ${name}`);
  const child = spawn(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: true,
    env: { ...process.env, FORCE_COLOR: "1" },
  });
  child.on("exit", (code) => {
    if (code) console.error(`✖ ${name} exited ${code}`);
  });
  children.push(child);
}
