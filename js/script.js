// js/script.js
// Main game controller for わあどる — ES module

import { GameModel, pickRandom, scoreGuess } from "./game.js";
import { mountKeyboard } from "./keyboard.js";

const WORD_LENGTH = 4;

// DOM elements
const board = document.getElementById("board");
const keyboardContainer = document.getElementById("keyboard");
const toast = document.getElementById("toast");
const victoryModal = document.getElementById("victory-modal");
const victoryAnswer = document.getElementById("victory-answer");
const attemptCount = document.getElementById("attempt-count");
const closeVictoryBtn = document.getElementById("close-victory");
const playAgainBtn = document.getElementById("play-again");
const themeToggle = document.getElementById("theme-toggle");
const physicalInput = document.getElementById("physical-input");

// Word repository (fetch + cache)
const wordCache = new Map();

async function fetchData(filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function getWordList(initialKana) {
  if (!wordCache.has(initialKana)) {
    const data = await fetchData(`json/katakana_data_${initialKana}行.json`);
    wordCache.set(initialKana, data || []);
  }
  return wordCache.get(initialKana);
}

async function isValidWord(word) {
  if (word.length !== WORD_LENGTH) return false;
  const initial = word[0];
  const data = await getWordList(initial);
  if (!data) return false;
  return data.some(item => item.kana === word);
}

// Answer selection: choose from the 71 full-size kana (first 71 unique values), excluding づ/を/ん
function getAnswerInitials() {
  const allValues = Array.from(globalThis.hiraganas.values());
  // First 71 are the full-size kana (46 seion + 20 dakuten + 5 handakuten)
  const fullSize = allValues.slice(0, 71);
  return fullSize.filter(ch => ch !== "づ" && ch !== "を" && ch !== "ん");
}

async function loadNewAnswer() {
  const initials = getAnswerInitials();
  // Try up to 5 different initials in case a JSON file is missing/empty
  for (let attempt = 0; attempt < 5; attempt++) {
    const initial = pickRandom(initials);
    const data = await getWordList(initial);
    if (data && data.length > 0) {
      const item = pickRandom(data);
      return { kana: item.kana, kanji: item.word };
    }
  }
  // Fallback: shouldn't happen, but handle gracefully
  showToast("単語を読み込めませんでした。ページを再読み込みしてください。", 5000);
  throw new Error("Failed to load answer after multiple attempts");
}

// Game state
let game = null;
let keyboardAPI = null;
let inputLocked = false;
let composing = false;

// Initialize game
async function initGame() {
  try {
    const { kana, kanji } = await loadNewAnswer();
    game = new GameModel(kana, kanji);
    renderBoard();
    mountKeyboardComponent();
    setupPhysicalInput();
    setupThemeToggle();
    setupModalButtons();
    // Focus physical input on desktop (pointer:fine) for IME/keyboard
    if (window.matchMedia("(pointer:fine)").matches) {
      physicalInput.focus({ preventScroll: true });
    }
  } catch (e) {
    console.error("Game initialization failed:", e);
    showToast("ゲームの初期化に失敗しました。", 5000);
  }
}

// Render the entire board from game state
function renderBoard() {
  board.innerHTML = "";
  // Render locked guesses
  for (const guess of game.guesses) {
    const row = createTileRow(guess.word, guess.states, true);
    board.appendChild(row);
  }
  // Render current guess row (always present)
  const currentRow = createTileRow(game.currentGuess, null, false);
  board.appendChild(currentRow);
  // Scroll to bottom to show active row
  requestAnimationFrame(() => {
    board.scrollTop = board.scrollHeight;
  });
}

// Create a tile row element
function createTileRow(word, states, locked) {
  const row = document.createElement("div");
  row.className = "tile-row";
  if (locked) row.dataset.locked = "true";

  const chars = Array.from(word).concat(Array(WORD_LENGTH - word.length).fill(""));
  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.textContent = chars[i];
    if (chars[i]) tile.classList.add("filled");
    if (locked && states) {
      tile.dataset.state = states[i];
      tile.classList.add(states[i] === 2 ? "correct" : states[i] === 1 ? "present" : "absent");
    }
    row.appendChild(tile);
  }
  return row;
}

// Update a single tile (for pop animation on input)
function updateTile(index, char, isLastInserted = false) {
  const currentRow = board.lastElementChild;
  if (!currentRow) return;
  const tile = currentRow.children[index];
  if (!tile) return;
  tile.textContent = char;
  tile.classList.add("filled");
  if (isLastInserted) {
    tile.classList.add("pop");
    tile.addEventListener("animationend", () => tile.classList.remove("pop"), { once: true });
  }
}

// Clear current row tiles (for backspace)
function clearTile(index) {
  const currentRow = board.lastElementChild;
  if (!currentRow) return;
  const tile = currentRow.children[index];
  if (!tile) return;
  tile.textContent = "";
  tile.classList.remove("filled");
}

// Mount on-screen keyboard
function mountKeyboardComponent() {
  keyboardAPI = mountKeyboard(keyboardContainer, {
    onKana: (kana) => handleKanaInput(kana),
    onSubmit: () => handleSubmit(),
    onDelete: () => handleBackspace(),
  });
}

// Show toast message
function showToast(message, duration = 1500) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

// Handle kana input from on-screen keyboard or physical input
function handleKanaInput(kana) {
  if (inputLocked || game.status !== "playing") return;
  const inserted = game.consumeText(kana);
  for (const [idx, ch] of inserted.entries()) {
    const tileIndex = game.currentGuess.length - inserted.length + idx;
    updateTile(tileIndex, ch, idx === inserted.length - 1);
  }
}

// Handle backspace
function handleBackspace() {
  if (inputLocked || game.status !== "playing") return;
  const hadBuffer = game.romajiBuffer.length > 0;
  const prevLength = game.currentGuess.length;
  const deleted = game.backspace();
  if (deleted) {
    if (hadBuffer) {
      // Romaji buffer changed; current row unchanged (buffer not shown in tiles)
      // Could show buffer in active tile but spec says tiles show completed kana only
    } else {
      // Removed a completed kana
      clearTile(prevLength - 1);
    }
  }
}

// Handle submit (Enter / 決定)
async function handleSubmit() {
  if (inputLocked || game.status !== "playing") return;
  inputLocked = true;

  const result = await game.submit(isValidWord);

  if (result.type === "incomplete") {
    // Shake current row
    const currentRow = board.lastElementChild;
    if (currentRow) {
      currentRow.classList.add("shake");
      currentRow.addEventListener("animationend", () => currentRow.classList.remove("shake"), { once: true });
    }
    showToast("4文字すべてを入力してください");
    inputLocked = false;
    return;
  }

  if (result.type === "invalid") {
    // Shake current row
    const currentRow = board.lastElementChild;
    if (currentRow) {
      currentRow.classList.add("shake");
      currentRow.addEventListener("animationend", () => currentRow.classList.remove("shake"), { once: true });
    }
    showToast("その四文字はリストにありません");
    inputLocked = false;
    return;
  }

  // Valid guess: animate reveal
  const currentRow = board.lastElementChild;
  const tiles = Array.from(currentRow.children);
  const states = result.guess.states;

  // Staggered flip animation
  for (let i = 0; i < WORD_LENGTH; i++) {
    const tile = tiles[i];
    const delay = i * 250;
    setTimeout(() => {
      tile.classList.add("flip");
      // At halfway point, swap to final state
      setTimeout(() => {
        tile.dataset.state = states[i];
        tile.classList.remove("filled");
        tile.classList.add(states[i] === 2 ? "correct" : states[i] === 1 ? "present" : "absent");
      }, 250);
    }, delay);
  }

  const totalRevealTime = (WORD_LENGTH - 1) * 250 + 500;

  if (result.type === "correct") {
    // Victory after reveal
    setTimeout(() => {
      showVictory();
      inputLocked = false;
    }, totalRevealTime + 250);
  } else {
    // Incorrect: after reveal, re-render board (adds new empty row)
    setTimeout(() => {
      renderBoard();
      updateKeyboardColors();
      inputLocked = false;
      // Focus physical input for next guess
      physicalInput.focus({ preventScroll: true });
    }, totalRevealTime);
  }
}

// Update keyboard key colors based on all guesses
function updateKeyboardColors() {
  if (!keyboardAPI) return;
  const keyStates = new Map();
  // Priority: correct (2) > present (1) > absent (0)
  for (const guess of game.guesses) {
    const chars = Array.from(guess.word);
    for (let i = 0; i < chars.length; i++) {
      const ch = chars[i];
      const state = guess.states[i];
      const existing = keyStates.get(ch);
      if (existing === undefined || state > existing) {
        keyStates.set(ch, state);
      }
    }
  }
  keyboardAPI.updateKeyStates(keyStates);
}

// Show victory modal
function showVictory() {
  victoryAnswer.textContent = `${game.answer}（${game.answerKanji}）`;
  attemptCount.textContent = `試行回数: ${game.guesses.length}`;
  victoryModal.showModal();
}

// Physical input handling (for physical keyboard + IME)
function setupPhysicalInput() {
  // composition events for IME
  physicalInput.addEventListener("compositionstart", () => {
    composing = true;
  });
  physicalInput.addEventListener("compositionend", (e) => {
    composing = false;
    // The final composed text is in e.data or physicalInput.value
    const text = e.data || physicalInput.value;
    if (text) {
      physicalInput.value = "";
      handlePhysicalText(text);
    }
  });

  // input event for non-IME typing (when not composing)
  physicalInput.addEventListener("input", (e) => {
    if (composing) return;
    const text = e.target.value;
    if (text) {
      e.target.value = "";
      handlePhysicalText(text);
    }
  });

  // keydown for special keys (Enter, Backspace) when physical input is focused
  physicalInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      handleBackspace();
    }
    // Let other keys go through to input event
  });

  // Global keydown for when focus is not on physical input
  document.addEventListener("keydown", (e) => {
    // Don't intercept if modal open
    if (victoryModal.open) return;
    // Don't intercept if typing in physical input (let its handlers run)
    if (document.activeElement === physicalInput) return;

    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      handleBackspace();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      // Printable character: feed to game and focus physical input for subsequent IME
      handlePhysicalText(e.key);
      physicalInput.focus({ preventScroll: true });
    }
  });
}

function handlePhysicalText(text) {
  if (inputLocked || game.status !== "playing") return;
  const inserted = game.consumeText(text);
  for (const [idx, ch] of inserted.entries()) {
    const tileIndex = game.currentGuess.length - inserted.length + idx;
    updateTile(tileIndex, ch, idx === inserted.length - 1);
  }
}

// Theme toggle
function setupThemeToggle() {
  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    document.documentElement.dataset.theme = isDark ? "light" : "dark";
    try {
      localStorage.setItem("waadoru-theme", isDark ? "light" : "dark");
    } catch (e) {
      // ignore
    }
  });
}

// Modal buttons
function setupModalButtons() {
  closeVictoryBtn.addEventListener("click", () => {
    victoryModal.close();
  });

  playAgainBtn.addEventListener("click", () => {
    victoryModal.close();
    location.reload();
  });

  // Close modal on Escape
  victoryModal.addEventListener("cancel", (e) => {
    e.preventDefault(); // prevent default close
    // We don't auto-close on Escape; user must click 閉じる or もう一度
  });
}

// Start
initGame();