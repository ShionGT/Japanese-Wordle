// tests/keyboard.test.js
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load keyboard module
const {
  KEYBOARD_ROWS,
  getKeyboardRows,
  nextSoundMode,
  mountKeyboard, // will be tested for existence only in unit
} = await import("../js/keyboard.js");

// Load hiragana map for corpus coverage
import "../js/hiragana.js";
const hiraganas = globalThis.hiraganas;

describe("Keyboard layout", () => {
  it("has exactly 5 rows", () => {
    assert.equal(KEYBOARD_ROWS.length, 5);
  });

  it("each row has exactly 11 cells", () => {
    for (const row of KEYBOARD_ROWS) {
      assert.equal(row.length, 11);
    }
  });

  it("contains 46 non-null base keys (seion)", () => {
    let count = 0;
    for (const row of KEYBOARD_ROWS) {
      for (const cell of row) {
        if (cell !== null) count++;
      }
    }
    assert.equal(count, 46);
  });

  it("getKeyboardRows returns same structure for seion", () => {
    const rows = getKeyboardRows("seion", false);
    assert.equal(rows.length, 5);
    for (const row of rows) {
      assert.equal(row.length, 11);
    }
    // non-null count should still be 46
    let count = 0;
    for (const row of rows) {
      for (const cell of row) {
        if (cell !== null) count++;
      }
    }
    assert.equal(count, 46);
  });

  it("dakuten mode transforms か→が, さ→ざ, た→だ, は→ば", () => {
    const rows = getKeyboardRows("dakuten", false);
    // Find positions of base keys in seion and verify dakuten
    // We'll just spot-check known transformations by scanning all cells
    const cells = rows.flat().filter(c => c !== null);
    assert.ok(cells.includes("が"), "dakuten should have が");
    assert.ok(cells.includes("ざ"), "dakuten should have ざ");
    assert.ok(cells.includes("だ"), "dakuten should have だ");
    assert.ok(cells.includes("ば"), "dakuten should have ば");
    // seion keys should be gone
    assert.ok(!cells.includes("か"), "dakuten should not have か");
    assert.ok(!cells.includes("さ"), "dakuten should not have さ");
    assert.ok(!cells.includes("た"), "dakuten should not have た");
    assert.ok(!cells.includes("は"), "dakuten should not have は");
  });

  it("handakuten mode transforms は→ぱ", () => {
    const rows = getKeyboardRows("handakuten", false);
    const cells = rows.flat().filter(c => c !== null);
    assert.ok(cells.includes("ぱ"), "handakuten should have ぱ");
    assert.ok(!cells.includes("ば"), "handakuten should not have ば");
    assert.ok(!cells.includes("は"), "handakuten should not have は");
  });

  it("small mode transforms small-capable keys", () => {
    const rows = getKeyboardRows("seion", true);
    const cells = rows.flat().filter(c => c !== null);
    assert.ok(cells.includes("ぁ"), "small should have ぁ");
    assert.ok(cells.includes("ゃ"), "small should have ゃ");
    assert.ok(cells.includes("ゅ"), "small should have ゅ");
    assert.ok(cells.includes("ょ"), "small should have ょ");
    assert.ok(cells.includes("っ"), "small should have っ");
    // base keys that have small variants should be replaced
    assert.ok(!cells.includes("あ"), "small should replace あ with ぁ");
    assert.ok(!cells.includes("や"), "small should replace や with ゃ");
    assert.ok(!cells.includes("ゆ"), "small should replace ゆ with ゅ");
    assert.ok(!cells.includes("よ"), "small should replace よ with ょ");
    assert.ok(!cells.includes("つ"), "small should replace つ with っ");
  });

  it("nextSoundMode cycles seion → dakuten → handakuten → seion", () => {
    assert.equal(nextSoundMode("seion"), "dakuten");
    assert.equal(nextSoundMode("dakuten"), "handakuten");
    assert.equal(nextSoundMode("handakuten"), "seion");
  });
});

describe("Corpus coverage: every answer character reachable via keyboard", () => {
  // Collect all kana appearing in json/katakana_data_*行.json
  function loadAllAnswerKana() {
    // json/ lives in the main repo, not the worktree
    const dir = path.resolve(__dirname, "..", "..", "..", "json");
    const files = fs.readdirSync(dir).filter(f => f.startsWith("katakana_data_") && f.endsWith(".json"));
    const set = new Set();
    for (const f of files) {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), "utf-8"));
      for (const item of data) {
        for (const ch of item.kana) {
          set.add(ch);
        }
      }
    }
    return set;
  }

  const answerKana = loadAllAnswerKana();

  // Generate all possible keyboard outputs across sound modes and small toggle
  function allReachableKana() {
    const modes = ["seion", "dakuten", "handakuten"];
    const smalls = [false, true];
    const reachable = new Set();
    for (const mode of modes) {
      for (const small of smalls) {
        const rows = getKeyboardRows(mode, small);
        for (const cell of rows.flat()) {
          if (cell !== null) reachable.add(cell);
        }
      }
    }
    return reachable;
  }

  const reachable = allReachableKana();

  it("covers all 77 answer characters", () => {
    const missing = [];
    for (const ch of answerKana) {
      if (!reachable.has(ch)) {
        missing.push(ch);
      }
    }
    if (missing.length > 0) {
      console.log("Missing characters:", missing.join(" "));
    }
    assert.equal(missing.length, 0, `Unreachable characters: ${missing.join(", ")}`);
  });
});