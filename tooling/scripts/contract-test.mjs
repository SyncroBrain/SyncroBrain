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
    "/ready",
    "/version",
    "not_ready",
    "control-manifest.schema.json",
    "MANIFEST_SIBLING_REQUIRED",
    "entitlementMode",
    "offline_license",
    "/integrations/dataluminary/status",
    "/integrations/dataluminary/embed-token",
    "ORIGIN_NOT_ALLOWED",
    "DASHBOARD_NOT_ALLOWED",
    "INTEGRATION_DISABLED",
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
    "/controller-kits",
    "/projects/{id}/controllers/claim",
    "/scenes/{id}/evaluate",
    "/education-labs/sessions",
    "LAB_SESSION_EXPIRED",
    "/demos/smart-window",
    "/demos/agri-irrigation",
    "/demos/agri-pond",
    "/demos/vistacast-bridge",
    "/integrations/vistacast/connections",
    "/integrations/vistacast/connections/{id}/events",
    "/incidents/{id}",
    "x-vistacast-signature",
    "/integrations/doerflow/invoke",
    "/integrations/doerflow/callbacks",
    "/integrations/doerflow/connections",
    "com.doerflow.trading.job.invoke",
    "syncrobrain.telemetry-digest.v1",
    "syncrobrain.incident-report.v1",
    "com.syncrobrain.incident.v1",
    "com.syncrobrain.work-order.v1",
    "x-doerflow-signature",
  ],
  "gateway.v1",
);

mustContain(
  "doerflow.v1.yaml",
  [
    "DOERFLOW_ENABLED",
    "/integrations/doerflow/invoke",
    "/integrations/doerflow/callbacks",
    "com.doerflow.trading.job.invoke",
    "syncrobrain.telemetry-digest.v1",
    "syncrobrain.incident-report.v1",
    "/integrations/events",
    "x-doerflow-signature",
    "productCode",
    "offeringCode",
    "sourceTenantId",
    "pricingUnit",
    "payee",
    "idempotencyKey",
    "com.doerflow.trading.job.settled",
  ],
  "doerflow.v1",
);

mustContain(
  "entitlement.v1.yaml",
  ["syncrobrain", "entitlement/skus", "license", "doerflow"],
  "entitlement.v1",
);

const requiredSchemas = [
  "pack-manifest.schema.json",
  "telemetry-envelope.schema.json",
  "command.schema.json",
  "incident.schema.json",
  "edge-registration.schema.json",
  "action-policy.schema.json",
  "controller-kit.schema.json",
  "scene.schema.json",
  "external-event-profile.schema.json",
  "alert.v1.schema.json",
  "doerflow-provider-registration.schema.json",
  "doerflow-invoke.schema.json",
  "doerflow-event.schema.json",
  "doerflow-callback.schema.json",
  "telemetry-digest.v1.schema.json",
  "incident-report.v1.schema.json",
  "control-manifest.schema.json",
  "smart-site-binding.schema.json",
  "dataluminary-embed.schema.json",
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

const examplesDir = join(contracts, "examples");
const examplePairs = [
  ["doerflow-provider-registration.json", "doerflow-provider-registration.schema.json"],
  ["doerflow-invoke.json", "doerflow-invoke.schema.json"],
  ["doerflow-event.json", "doerflow-event.schema.json"],
  ["telemetry-digest.v1.json", "telemetry-digest.v1.schema.json"],
  ["incident-report.v1.json", "incident-report.v1.schema.json"],
  ["control-manifest.json", "control-manifest.schema.json"],
  ["smart-site-binding.json", "smart-site-binding.schema.json"],
  ["dataluminary-embed.json", "dataluminary-embed.schema.json"],
];
for (const [exampleName, schemaName] of examplePairs) {
  const examplePath = join(examplesDir, exampleName);
  if (!existsSync(examplePath)) {
    console.error(`missing example ${exampleName}`);
    process.exit(1);
  }
  const example = JSON.parse(readFileSync(examplePath, "utf8"));
  const schema = JSON.parse(readFileSync(join(schemasDir, schemaName), "utf8"));
  for (const key of schema.required ?? []) {
    if (example[key] === undefined) {
      console.error(`${exampleName} missing required ${key}`);
      process.exit(1);
    }
  }
  const blob = JSON.stringify(example);
  if (/deviceToken|mqttPassword|tbTenantAdmin|v1\/devices\/me\/telemetry/i.test(blob)) {
    console.error(`${exampleName} leaks telemetry bus or credentials`);
    process.exit(1);
  }
}

/**
 * Cloud Lite standalone stays standalone: postgres + thingsboard are the only required
 * components, and no sibling product may be promoted to required.
 */
{
  const manifest = JSON.parse(
    readFileSync(join(examplesDir, "control-manifest.json"), "utf8"),
  );
  const required = manifest.components.filter((c) => c.requirement === "required");
  const requiredKeys = required.map((c) => c.key).sort();
  if (requiredKeys.join(",") !== "postgres,thingsboard") {
    console.error(
      `control-manifest.json standalone required set must be postgres+thingsboard, got ${requiredKeys.join(",")}`,
    );
    process.exit(1);
  }
  if (required.some((c) => c.kind === "sibling-product" || c.kind === "control-plane")) {
    console.error("control-manifest.json marks a sibling product / control plane as required");
    process.exit(1);
  }
}

console.log("contracts ok");
