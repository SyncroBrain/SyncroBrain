import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loadPacks } from "../src/packs/catalog.mjs";

describe("pack rollback metadata", () => {
  it("never sets command rollbackId to the same command id", () => {
    for (const pack of loadPacks()) {
      const ids = new Set((pack.commands ?? []).map((cmd) => cmd.id));
      for (const cmd of pack.commands ?? []) {
        if (!cmd.rollbackId) continue;
        assert.notEqual(cmd.rollbackId, cmd.id, `${pack.slug}.${cmd.id}`);
        assert.ok(
          ids.has(cmd.rollbackId),
          `${pack.slug}.${cmd.id} rollbackId ${cmd.rollbackId} is not a command`,
        );
      }
    }
  });
});
