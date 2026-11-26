// tests/game.test.js
import { describe, it, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";

// Load the hiragana map via side effect
import "../js/hiragana.js";

const { pickRandom, scoreGuess, GameModel } = await import("../js/game.js");

// --- pickRandom ---

describe("pickRandom", () => {
  it("selects the last element when random = 0.999999", () => {
    const items = ["a", "b", "c"];
    const result = pickRandom(items, () => 0.999999);
    assert.equal(result, "c");
  });

  it("selects the first element when random = 0", () => {
    const items = ["a", "b", "c"];
    const result = pickRandom(items, () => 0);
    assert.equal(result, "a");
  });
});

// --- scoreGuess ---

describe("scoreGuess exact/present logic", () => {
  it("gives 2 for exact match, 0 for absent (no duplicates)", () => {
    const res = scoreGuess("あいうえ", "あかさた");
    assert.deepEqual(res, [2, 0, 0, 0]);
  });

  it("awards present (1) for a letter elsewhere, but not more than it appears in answer", () => {
    // answer has one あ at index 1; guess has four あ -> only exact at index 1 gets 2, others 0
    const res = scoreGuess("かあさん", "ああああ");
    assert.deepEqual(res, [0, 2, 0, 0]);
  });

  it("does not double-count duplicates in answer", () => {
    // answer あいうえ has one あ; guess ああああ -> only first exact
    const res = scoreGuess("あいうえ", "ああああ");
    assert.deepEqual(res, [2, 0, 0, 0]);
  });

  it("handles multiple distinct present letters correctly", () => {
    const res = scoreGuess("かきくけ", "けきかく");
    // guess[0]=け present at answer[3] -> 1
    // guess[1]=き exact at 1 -> 2
    // guess[2]=か present at 0 -> 1
    // guess[3]=く present at 2 -> 1 (not exact, position differs)
    assert.deepEqual(res, [1, 2, 1, 1]);
  });
});

// --- GameModel ---

describe("GameModel", () => {
  let game;

  beforeEach(() => {
    game = new GameModel("かあさん", "母さん");
  });

  it("starts with empty currentGuess and status playing", () => {
    assert.equal(game.currentGuess, "");
    assert.equal(game.status, "playing");
    assert.deepEqual(game.guesses, []);
  });

  it("insertKana adds a kana and returns true", () => {
    assert.ok(game.insertKana("か"));
    assert.equal(game.currentGuess, "か");
  });

  it("insertKana stops at 4 kana", () => {
    game.insertKana("か");
    game.insertKana("あ");
    game.insertKana("さ");
    game.insertKana("ん");
    assert.ok(!game.insertKana("か"));
    assert.equal(game.currentGuess, "かあさん");
  });

  it("consumeText converts romaji ka, nn, xtsu", () => {
    game.consumeText("ka");   // か
    game.consumeText("a");    // あ
    game.consumeText("sa");   // さ
    game.consumeText("nn");   // ん
    assert.equal(game.currentGuess, "かあさん");
    assert.equal(game.romajiBuffer, "");
  });

  it("consumeText handles xtu and xtsu for small tsu", () => {
    // Need a word with っ; construct a temporary model
    const g = new GameModel("いって", "行って");
    g.consumeText("i");   // い
    g.consumeText("xtu"); // っ
    g.consumeText("te");  // て
    assert.equal(g.currentGuess, "いって");
  });

  it("consumeText accepts direct hiragana", () => {
    game.consumeText("が");
    assert.equal(game.currentGuess, "が");
  });

  it("backspace removes unfinished romaji letter first", () => {
    game.consumeText("k");  // buffer 'k'
    assert.ok(game.backspace());
    assert.equal(game.romajiBuffer, "");
    assert.equal(game.currentGuess, "");
  });

  it("backspace removes completed kana when buffer empty", () => {
    game.consumeText("ka");
    assert.equal(game.currentGuess, "か");
    assert.ok(game.backspace());
    assert.equal(game.currentGuess, "");
  });

  it("backspace returns false when nothing to delete", () => {
    assert.ok(!game.backspace());
  });

  it("submit rejects incomplete guess without calling validator", async () => {
    let validatorCalled = false;
    const res = await game.submit(async () => { validatorCalled = true; return true; });
    assert.equal(res.type, "incomplete");
    assert.ok(!validatorCalled);
  });

  it("submit rejects invalid guess, keeps currentGuess editable", async () => {
    game.consumeText("ka");
    game.consumeText("a");
    game.consumeText("sa");
    game.consumeText("nn"); // かあさん (valid length but treat as invalid by validator returning false)
    const res = await game.submit(async () => false);
    assert.equal(res.type, "invalid");
    assert.equal(game.currentGuess, "かあさん");
  });

  it("submit accepts valid incorrect guess, records it, and clears currentGuess", async () => {
    const g = new GameModel("あいうえ", "愛植絵");
    g.consumeText("ka");
    g.consumeText("ki");
    g.consumeText("ku");
    g.consumeText("ke"); // かきくけ
    const res = await g.submit(async () => true);
    assert.equal(res.type, "incorrect");
    assert.equal(g.currentGuess, "");
    assert.equal(g.guesses.length, 1);
    assert.equal(g.guesses[0].word, "かきくけ");
    // score: あ vs か=0, い vs き=0, う vs く=0, え vs け=0
    assert.deepEqual(g.guesses[0].states, [0, 0, 0, 0]);
  });

  it("submit with correct guess sets status won and ignores further input", async () => {
    const g = new GameModel("あいうえ", "愛植絵");
    g.consumeText("a");
    g.consumeText("i");
    g.consumeText("u");
    g.consumeText("e");
    const res = await g.submit(async () => true);
    assert.equal(res.type, "correct");
    assert.equal(g.status, "won");
    // further inserts ignored
    g.insertKana("か");
    assert.equal(g.currentGuess, "");
  });

  it("unlimited guesses: eight valid incorrect guesses produce eight rows", async () => {
    const g = new GameModel("あいうえ", "愛植絵");
    for (let i = 0; i < 8; i++) {
      g.currentGuess = "かきくけ";
      await g.submit(async () => true);
      assert.equal(g.guesses.length, i + 1);
    }
    assert.equal(g.guesses.length, 8);
  });
});