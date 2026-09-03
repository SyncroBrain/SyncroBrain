/**
 * Industry Pack drafts that compose Controller Kits (spec/packs/*-draft.json).
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const packsDir = join(dirname(fileURLToPath(import.meta.url)), "../../../spec/packs");

let cache;

export function loadPacks() {
  if (cache) return cache;
  const files = readdirSync(packsDir).filter((name) => name.endsWith(".json"));
  cache = files.map((name) => JSON.parse(readFileSync(join(packsDir, name), "utf8")));
  return cache;
}

export function getPack(slug) {
  return loadPacks().find((pack) => pack.slug === slug) ?? null;
}
