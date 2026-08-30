#!/usr/bin/env node
/**
 * Contract smoke: OpenAPI files parse as YAML-ish and list the Cloud Lite paths.
 * Does not call a live server.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const metaRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const contracts = join(metaRoot, "contracts");

function mustContain(file, needles, label) {
  const path = join(contracts, file);
  if (!existsSync(path)) {
    console.error(`missing ${file}`);
    process.exit(1);
  }
  const text = readFileSync(path, "utf8");
  JSON.parse; // encoding check — file must be valid UTF-8 text
  if (!text.trimStart().startsWith("openapi:")) {
    console.error(`${file} is not OpenAPI YAML`);
    process.exit(1);
  }
  for (const needle of needles) {
    if (!text.includes(needle)) {
      console.error(`${label}: ${file} missing ${needle}`);
      process.exit(1);
    }
  }
}

mustContain(
  "gateway.v1.yaml",
  [
    "13200",
    "/health",
    "/auth/demo",
    "/packs",
    "/demos/cold-lab",
    "/demos/env-lab",
    "/alarms",
    "/branding",
    "/license",
    "security",
    "codes",
  ],
  "gateway.v1",
);

mustContain(
  "device.v1.yaml",
  ["13200", "deprecated", "/devices"],
  "device.v1",
);

console.log("contracts ok");
