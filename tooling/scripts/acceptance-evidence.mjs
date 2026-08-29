#!/usr/bin/env node
/**
 * Collect a machine-readable acceptance evidence pack for a follow-up Grok 4.6 High review.
 * Does not call any model API. Missing keys must not fail unit tests.
 *
 *   pnpm acceptance:evidence
 *   pnpm acceptance:prepare
 *   node tooling/scripts/acceptance-evidence.mjs --skip-e2e
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const metaRoot = join(here, "../..");
const gatewayDir = join(metaRoot, "iot-gateway");
const consoleDir = join(metaRoot, "iot-console-web");
const skipE2e = process.argv.includes("--skip-e2e");
const skipBuild = process.argv.includes("--skip-build");
const outDir = join(metaRoot, "plan/validation/acceptance/last-run");

function pnpmDir(dir, args) {
  return ["pnpm", "--dir", dir, ...args];
}

function run(id, title, command, cwd = metaRoot, env = {}) {
  const started = Date.now();
  const result = spawnSync(command[0], command.slice(1), {
    cwd,
    env: { ...process.env, ...env },
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  return {
    id,
    title,
    command: command.join(" "),
    cwd,
    exitCode: result.status ?? 1,
    durationMs: Date.now() - started,
    stdout: (result.stdout ?? "").slice(-8000),
    stderr: (result.stderr ?? "").slice(-4000),
  };
}

function classify(step, extra = {}) {
  if (step.exitCode === 0) return { ...step, status: extra.status ?? "pass", ...extra };
  return { ...step, status: extra.failStatus ?? "fail", ...extra };
}

function playwrightSummary(jsonPath) {
  if (!existsSync(jsonPath)) return null;
  try {
    const report = JSON.parse(readFileSync(jsonPath, "utf8"));
    const stats = report.stats ?? {};
    return {
      expected: stats.expected ?? 0,
      unexpected: stats.unexpected ?? 0,
      skipped: stats.skipped ?? 0,
      flaky: stats.flaky ?? 0,
    };
  } catch {
    return { parseError: true };
  }
}

mkdirSync(join(gatewayDir, "test-results"), { recursive: true });
mkdirSync(join(consoleDir, "test-results"), { recursive: true });
mkdirSync(outDir, { recursive: true });

const steps = [];

steps.push(
  classify(run("unit-gateway", "iot-gateway unit", pnpmDir(gatewayDir, ["test"]))),
);
steps.push(
  classify(run("unit-console", "iot-console-web unit", pnpmDir(consoleDir, ["test"]))),
);
steps.push(classify(run("lint-gateway", "iot-gateway tsc", pnpmDir(gatewayDir, ["lint"]))));
steps.push(classify(run("lint-console", "iot-console-web tsc", pnpmDir(consoleDir, ["lint"]))));

if (!skipBuild) {
  steps.push(classify(run("build-gateway", "iot-gateway build", pnpmDir(gatewayDir, ["build"]))));
  steps.push(classify(run("build-console", "iot-console-web build", pnpmDir(consoleDir, ["build"]))));
}

let e2eStats = null;
if (!skipE2e) {
  const e2e = run("e2e", "Playwright (skip if stack down)", pnpmDir(consoleDir, ["e2e"]));
  e2eStats = playwrightSummary(join(consoleDir, "test-results/e2e-results.json"));
  const skippedOnly =
    e2e.exitCode === 0 && e2eStats && e2eStats.unexpected === 0 && e2eStats.expected === 0;
  const livePassed =
    e2e.exitCode === 0 && e2eStats && e2eStats.unexpected === 0 && (e2eStats.expected ?? 0) > 0;
  steps.push(
    classify(e2e, {
      status: livePassed ? "pass" : skippedOnly ? "skipped" : e2e.exitCode === 0 ? "pass" : "fail",
      playwright: e2eStats,
    }),
  );
}

const failed = steps.filter((s) => s.status === "fail");
const e2eStep = steps.find((s) => s.id === "e2e");
const livePassed = e2eStep?.status === "pass" && (e2eStats?.expected ?? 0) > 0;
const liveBlocked = !livePassed;
const suggestedVerdict = failed.length ? "fail" : livePassed ? "pass" : "blocked";

const checklistPath = join(consoleDir, "e2e/acceptance-checklist.json");
let checklist = null;
if (existsSync(checklistPath)) {
  checklist = JSON.parse(readFileSync(checklistPath, "utf8"));
}

const evidence = {
  generatedAt: new Date().toISOString(),
  node: process.version,
  cwd: metaRoot,
  suggestedVerdict,
  note:
    "suggestedVerdict 由脚本按退出码推断，正式 pass/fail 须由 Grok 4.6 High 按 schema.json 审阅。skipped 活栈 ≠ pass。",
  rubric: "plan/validation/acceptance/rubric.json",
  schema: "plan/validation/acceptance/schema.json",
  reviewerPrompt: "plan/validation/acceptance/reviewer-prompt.md",
  checklist: checklist ? "iot-console-web/e2e/acceptance-checklist.json" : null,
  checklistItems: checklist?.items?.map((item) => item.id) ?? [],
  steps: steps.map(({ stdout, stderr, ...rest }) => ({
    ...rest,
    stdoutTail: stdout,
    stderrTail: stderr,
  })),
};

const jsonPath = join(outDir, "evidence.json");
writeFileSync(jsonPath, `${JSON.stringify(evidence, null, 2)}\n`, "utf8");
JSON.parse(readFileSync(jsonPath, "utf8"));

const md = [
  `# Acceptance evidence (${evidence.generatedAt})`,
  "",
  `- Node ${evidence.node}`,
  `- suggestedVerdict: **${suggestedVerdict}** (deterministic helper; Grok 4.6 High must confirm)`,
  "",
  "| id | status | exit | duration |",
  "|----|--------|------|----------|",
  ...steps.map((s) => `| ${s.id} | ${s.status} | ${s.exitCode} | ${s.durationMs}ms |`),
  "",
  e2eStats
    ? `Playwright stats: expected=${e2eStats.expected ?? "?"} unexpected=${e2eStats.unexpected ?? "?"} skipped=${e2eStats.skipped ?? "?"}`
    : "Playwright: not run (`--skip-e2e`)",
  "",
  "## Next",
  "Hand `evidence.json` + `reviewer-prompt.md` to a Grok 4.6 High agent.",
  liveBlocked
    ? "Live E2E skipped. Start Gateway+Console+TB then `E2E_REQUIRE_STACK=1 pnpm --dir iot-console-web e2e`."
    : "",
  "",
].join("\n");
writeFileSync(join(outDir, "evidence.md"), md, "utf8");

console.log(md);
console.log(`Wrote ${jsonPath}`);
if (failed.length) process.exit(1);
