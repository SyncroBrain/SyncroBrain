#!/usr/bin/env node
/**
 * Contract smoke: OpenAPI files parse and list Cloud Lite + multi-vertical paths.
 * JSON schemas must parse. Does not call a live server.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const metaRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");
const contracts = join(metaRoot, "contracts");
const schemasDir = join(contracts, "schemas");

function mustContain(file, needles, label) {
  const path = join(contracts, file);
  if (!existsSync(path)) {
    console.error(`missing ${file}`);
    process.exit(1);
  }
  const text = readFileSync(path, "utf8");
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
    "/entitlement/skus",
    "/projects",
    "/incidents",
    "/incidents/{id}/ack",
    "/sites/{id}/duty-roster",
    "/calibrations",
    "/reports",
    "/commands",
    "/edge/commands",
    "/ai/chat",
    "/ai/tools",
    "/ai/connection",
    "/edge/nodes",
  ],
  "gateway.v1",
);

mustContain(
  "entitlement.v1.yaml",
  ["syncrobrain", "entitlement/skus", "license"],
  "entitlement.v1",
);

const requiredSchemas = [
  "pack-manifest.schema.json",
  "telemetry-envelope.schema.json",
  "command.schema.json",
  "incident.schema.json",
  "edge-registration.schema.json",
  "action-policy.schema.json",
];

if (!existsSync(schemasDir)) {
  console.error("missing contracts/schemas");
  process.exit(1);
}

const listed = new Set(readdirSync(schemasDir));
for (const name of requiredSchemas) {
  if (!listed.has(name)) {
    console.error(`missing schema ${name}`);
    process.exit(1);
  }
  const parsed = JSON.parse(readFileSync(join(schemasDir, name), "utf8"));
  if (parsed.type !== "object" || !parsed.properties) {
    console.error(`${name} is not an object schema`);
    process.exit(1);
  }
}

console.log("contracts ok");
