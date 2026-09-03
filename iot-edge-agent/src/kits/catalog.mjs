/**
 * Controller Kit catalog — loads spec/kits/*.json (single source of truth).
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const kitsDir = join(dirname(fileURLToPath(import.meta.url)), "../../../spec/kits");

let cache;

export function kitsPath() {
  return kitsDir;
}

export function loadKits() {
  if (cache) return cache;
  const files = readdirSync(kitsDir).filter((name) => name.startsWith("kit-") && name.endsWith(".json"));
  cache = files.map((name) => JSON.parse(readFileSync(join(kitsDir, name), "utf8")));
  return cache;
}

export function getKit(slug) {
  return loadKits().find((kit) => kit.slug === slug) ?? null;
}

export function requiredChannelKeys(kit) {
  return (kit?.channels ?? []).filter((ch) => ch.required).map((ch) => ch.key);
}

/**
 * Dual bind path: official firmware serial, or protocol coverage of required channels.
 */
export function claimController({ kitSlug, bindPath, serial, telemetryKeys = [] } = {}) {
  const kit = getKit(kitSlug);
  if (!kit) return { status: "Rejected", reason: "UNKNOWN_KIT" };
  if (!kit.bindPaths?.includes(bindPath)) return { status: "Rejected", reason: "BIND_PATH" };

  if (bindPath === "official") {
    if (!serial || !String(serial).startsWith("SBK-")) {
      return { status: "Rejected", reason: "SERIAL" };
    }
  } else if (bindPath === "protocol") {
    const missing = requiredChannelKeys(kit).filter((key) => !telemetryKeys.includes(key));
    if (missing.length) return { status: "Rejected", reason: "CHANNEL_GAP", missing };
  } else {
    return { status: "Rejected", reason: "BIND_PATH" };
  }

  return {
    status: "Accepted",
    kitSlug: kit.slug,
    bindPath,
    channels: kit.channels.map((ch) => ch.key),
    commands: kit.commands.map((cmd) => cmd.id),
  };
}
