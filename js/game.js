// js/game.js
// DOM-independent game logic for わあどる

// Access the global hiragana map set by hiragana.js
const hiraganas = globalThis.hiraganas;
// Set of all kana characters (map values) for direct input detection
const kanaSet = new Set(hiraganas.values());

/**
 * Returns a random element from items using the provided random function.
 * The random function should return a number in [0, 1).
 * Ensures the last element can be selected (unlike Math.round(Math.floor(...))).
 */
export function pickRandom(items, random = Math.random) {
  if (!items.length) return undefined;
  const idx = Math.floor(random() * items.length);
  return items[idx];
}

/**
 * Two-pass Wordle scoring: 2 = correct position, 1 = present elsewhere, 0 = absent.
 * Handles duplicates correctly: a letter is counted only as many times as it appears in the answer.
 * @param {string} answer - the correct 4-kana answer
 * @param {string} guess - the 4-kana guess
 * @returns {number[]} array of 4 numbers (2/1/0)
 */
export function scoreGuess(answer, guess) {
  const ans = Array.from(answer);
  const gue = Array.from(guess);
  const len = ans.length;
  const res = new Array(len).fill(0);
  const used = new Array(len).fill(false);

  // Pass 1: exact matches
  for (let i = 0; i < len; i++) {
    if (gue[i] === ans[i]) {
      res[i] = 2;
      used[i] = true;
    }
  }

  // Pass 2: present elsewhere
  for (let i = 0; i < len; i++) {
    if (res[i] === 2) continue;
    for (let j = 0; j < len; j++) {
      if (!used[j] && gue[i] === ans[j]) {
        res[i] = 1;
        used[j] = true;
        break;
      }
    }
  }
  return res;
}

/**
 * GameModel encapsulates the game state and logic.
 */
export class GameModel {
  /**
   * @param {string} answer - the 4-kana answer
   * @param {string} answerKanji - the kanji form for display
   */
  constructor(answer, answerKanji) {
    this.answer = answer;
    this.answerKanji = answerKanji;
    this.guesses = [];           // [{word, states}]
    this.currentGuess = "";      // completed kana string
    this.romajiBuffer = "";      // in-progress romaji
    this.status = "playing";     // "playing" | "won"
  }

  /** Insert a completed kana character. Returns true if inserted. */
  insertKana(kana) {
    if (this.status !== "playing") return false;
    if (this.currentGuess.length >= 4) return false;
    this.currentGuess += kana;
    return true;
  }

  /**
   * Feed arbitrary text (romaji or direct kana). Returns array of inserted kana.
   * Direct kana (any character present in the kanaSet) are inserted immediately.
   * ASCII letters accumulate in romajiBuffer; when buffer matches a key in hiraganas,
   * it is converted and buffer cleared.
   * xtu/xtsu for small tsu are also in the map.
   */
  consumeText(text) {
    const inserted = [];
    for (const ch of Array.from(text)) {
      // Direct kana input (character exists in the kana set)
      if (kanaSet.has(ch)) {
        this.romajiBuffer = "";
        this.insertKana(ch);
        inserted.push(ch);
        continue;
      }
      // ASCII letters go into romaji buffer
      if (/^[a-zA-Z]$/.test(ch)) {
        this.romajiBuffer += ch.toLowerCase();
        // Check if buffer is a complete romaji mapping
        if (hiraganas.has(this.romajiBuffer)) {
          const kana = hiraganas.get(this.romajiBuffer);
          this.insertKana(kana);
          inserted.push(kana);
          this.romajiBuffer = "";
        }
        // Note: incomplete buffer stays for next keystroke
        continue;
      }
      // Other characters ignored
    }
    return inserted;
  }

  /** Backspace: removes a romaji letter if buffer non-empty, else last kana. */
  backspace() {
    if (this.romajiBuffer.length > 0) {
      this.romajiBuffer = this.romajiBuffer.slice(0, -1);
      return true;
    }
    if (this.currentGuess.length > 0) {
      this.currentGuess = this.currentGuess.slice(0, -1);
      return true;
    }
    return false;
  }

  /**
   * Submit the current guess.
   * @param {function(string): Promise<boolean>} validateWord - returns true if word exists
   * @returns {Promise<{type: string, guess?: {word: string, states: number[]}}>}
   */
  async submit(validateWord) {
    if (this.status !== "playing") {
      return { type: "ignored" };
    }
    if (this.currentGuess.length < 4) {
      return { type: "incomplete" };
    }
    const word = this.currentGuess;
    const isValid = await validateWord(word);
    if (!isValid) {
      return { type: "invalid" };
    }
    const states = scoreGuess(this.answer, word);
    this.guesses.push({ word, states });
    this.currentGuess = "";
    this.romajiBuffer = "";
    if (word === this.answer) {
      this.status = "won";
      return { type: "correct", guess: { word, states } };
    }
    return { type: "incorrect", guess: { word, states } };
  }
}