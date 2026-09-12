import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DRAFT = "0.1-draft";
const SKIP_CONSOLE = "iot-console-web locales absent";
const SKIP_PACKS = "iot-gateway packs absent";

/**
 * Collect titleKey, labelKey, and localeKeys[] from a pack manifest (any nesting).
 * @param {unknown} value
 * @param {Set<string>} [out]
 * @returns {Set<string>}
 */
export function collectManifestLocaleKeys(value, out = new Set()) {
  if (value == null || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const item of value) collectManifestLocaleKeys(item, out);
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    if ((k === "labelKey" || k === "titleKey") && typeof v === "string" && v.trim()) {
      out.add(v);
    } else if (k === "localeKeys" && Array.isArray(v)) {
      for (const key of v) {
        if (typeof key === "string" && key.trim()) out.add(key);
      }
    } else {
      collectManifestLocaleKeys(v, out);
    }
  }
  return out;
}

/**
 * @param {string} packsRoot
 * @returns {string[]}
 */
export function listDraftManifestPaths(packsRoot) {
  if (!existsSync(packsRoot)) return [];
  const out = [];
  for (const slug of readdirSync(packsRoot)) {
    const manifestPath = join(packsRoot, slug, DRAFT, "manifest.json");
    if (existsSync(manifestPath)) out.push(manifestPath);
  }
  return out;
}

/**
 * Pack Factory: every pack locale key must exist in Console en + zh.
 * Skip (do not fail) when the gitignored nested console (or packs) tree is missing.
 *
 * @param {string} metaRoot
 * @returns {{
 *   skipped: boolean,
 *   reason?: string,
 *   ok?: boolean,
 *   keyCount?: number,
 *   missingEn?: string[],
 *   missingZh?: string[],
 * }}
 */
export function checkPackConsoleLocales(metaRoot) {
  const packsRoot = join(metaRoot, "iot-gateway", "packs");
  const enPath = join(metaRoot, "iot-console-web", "src", "locales", "en", "console.json");
  const zhPath = join(metaRoot, "iot-console-web", "src", "locales", "zh", "console.json");

  if (!existsSync(enPath) || !existsSync(zhPath)) {
    return { skipped: true, reason: SKIP_CONSOLE };
  }
  if (!existsSync(packsRoot)) {
    return { skipped: true, reason: SKIP_PACKS };
  }

  const manifests = listDraftManifestPaths(packsRoot);
  const keys = new Set();
  for (const path of manifests) {
    collectManifestLocaleKeys(JSON.parse(readFileSync(path, "utf8")), keys);
  }

  const en = JSON.parse(readFileSync(enPath, "utf8"));
  const zh = JSON.parse(readFileSync(zhPath, "utf8"));
  const enKeys = new Set(Object.keys(en));
  const zhKeys = new Set(Object.keys(zh));
  const missingEn = [...keys].filter((k) => !enKeys.has(k)).sort();
  const missingZh = [...keys].filter((k) => !zhKeys.has(k)).sort();

  return {
    skipped: false,
    ok: missingEn.length === 0 && missingZh.length === 0,
    keyCount: keys.size,
    missingEn,
    missingZh,
  };
}
