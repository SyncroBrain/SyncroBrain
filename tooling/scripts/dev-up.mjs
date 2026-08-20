#!/usr/bin/env node
/**
 * One-shot local dev bootstrap (Meta-Repo root).
 *
 *   ./dev.sh
 *   ./dev.sh --skip-docker
 *   ./dev.sh --required-only
 *   node tooling/scripts/dev-up.mjs --skip-init
 */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { execSync, spawnSync } from "node:child_process";
import { findMetaRoot } from "./lib/paths.mjs";
import { loadMetaManifest } from "./lib/meta-manifest.mjs";
import { setupProjectEnv } from "./lib/setup-env.mjs";
import { waitForPort } from "./lib/wait-port.mjs";

const metaRoot = findMetaRoot();
if (!metaRoot) {
  console.error("❌ Run from SyncroBrain Meta-Repo root.");
  process.exit(1);
}

const skipDocker = process.argv.includes("--skip-docker");
const skipInit = process.argv.includes("--skip-init");
const requiredOnly = process.argv.includes("--required-only");
const useHttps = process.argv.includes("--https");

console.log("🚀 SyncroBrain dev-up — clone · install · docker\n");

check("node", ["-v"]);
check("pnpm", ["-v"]);
if (!skipDocker) check("docker", ["version"]);

if (!skipInit) {
  const initArgs = ["tooling/scripts/init-repos.mjs"];
  if (requiredOnly) initArgs.push("--required-only");
  if (useHttps) initArgs.push("--https");
  run("node", initArgs);
}

const createdEnv = setupProjectEnv(metaRoot);
if (createdEnv.length > 0) {
  console.log(`\n📝 Created env from examples:\n   ${createdEnv.join("\n   ")}`);
}

if (!skipDocker) {
  const compose = join(metaRoot, "deploy/docker-compose.dev.yml");
  if (!existsSync(compose)) {
    console.warn("⚠️  deploy/ not cloned — skip docker (run ./init.sh)");
  } else {
    console.log("\n🐳 docker compose up -d --build (PG :5438, TB :9080, gateway :13200, console :5180)...");
    execSync(`docker compose -f "${compose}" up -d --build`, {
      cwd: join(metaRoot, "deploy"),
      stdio: "inherit",
      shell: true,
    });
    try {
      console.log("⏳ Waiting for PostgreSQL :5438...");
      await waitForPort(5438);
      console.log("✅ PostgreSQL ready");
    } catch {
      console.warn("⚠️  PostgreSQL not ready — migrations may fail");
    }
    try {
      console.log("⏳ Waiting for ThingsBoard :9080 (first boot 1–2 min)...");
      await waitForPort(9080, "127.0.0.1", 180_000);
      console.log("✅ ThingsBoard port open");
    } catch {
      console.warn("⚠️  ThingsBoard not ready — open http://127.0.0.1:9080 later");
    }
  }
}

const manifest = loadMetaManifest(metaRoot);
const installOrder =
  manifest.devUpInstallOrder ??
  manifest.installOrder.filter((k) => manifest.projects[k]);

for (const key of installOrder) {
  const proj = manifest.projects[key];
  if (!proj) continue;
  const dir = join(metaRoot, proj.path);
  if (!existsSync(join(dir, "package.json"))) {
    console.log(`⏭️  skip ${proj.path} (not cloned — run ./init.sh)`);
    continue;
  }

  const installFlags =
    key === "iot-gateway" ? "install --no-frozen-lockfile" : "install";
  console.log(`\n📦 pnpm ${installFlags} → ${proj.path}`);
  try {
    execSync(`pnpm ${installFlags}`, {
      cwd: dir,
      stdio: "inherit",
      shell: true,
        env: {
        ...process.env,
      },
    });
  } catch {
    console.error(`❌ pnpm install failed in ${proj.path}`);
    if (key === "iot-gateway") {
      console.error("   Check iot-gateway/.npmrc points at registry.npmjs.org for @luminaryworks");
    }
    process.exit(1);
  }
}

const gatewayDir = join(metaRoot, "iot-gateway");
if (existsSync(join(gatewayDir, "package.json")) && !skipDocker) {
  console.log("\n🗄️  pnpm migration:run → iot-gateway");
  try {
    execSync("pnpm migration:run", {
      cwd: gatewayDir,
      stdio: "inherit",
      shell: true,
    });
  } catch {
    console.warn("⚠️  migration:run failed — run manually after DB is up");
  }
}

printNextSteps(metaRoot, skipDocker);

function check(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: "utf8", shell: true });
  if (r.status !== 0) {
    console.error(`❌ Missing or broken: ${cmd}`);
    process.exit(1);
  }
}

function run(cmd, args) {
  execSync([cmd, ...args].join(" "), { cwd: metaRoot, stdio: "inherit", shell: true });
}

function printNextSteps(root, skipDocker) {
  console.log(`
════════════════════════════════════════════════════════════
✅ Bootstrap complete

一键启动 gateway + console（Windows 推荐）:
  .\\dev-mvp.ps1

或分别开终端:
  cd iot-gateway && pnpm dev     → http://localhost:13200
  cd iot-console-web && pnpm dev → http://localhost:5180
  cd website && pnpm dev                  → http://localhost:13013
  cd docs && pnpm dev                     → http://localhost:13014

统一登录（Logto）需先启动 LuminaryWorks/identity:
  cd ../LuminaryWorks/identity && ./bootstrap.ps1

IDE: open syncrobrain.code-workspace
${skipDocker ? "" : "Docker: postgres :5438 · ThingsBoard CE :9080 · MQTT :1883"}
════════════════════════════════════════════════════════════
`);
}
