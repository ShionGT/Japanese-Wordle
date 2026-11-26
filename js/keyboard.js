// js/keyboard.js
// Kana keyboard model and DOM component for わあどる

// Base 50音 grid: 5 rows × 11 columns, null = spacer
// Rows correspond to あ段, い段, う段, え段, お段
// Columns: あ, か, さ, た, な, は, ま, や, ら, わ, (ん)
export const KEYBOARD_ROWS = [
  // あ段
  ["あ", "か", "さ", "た", "な", "は", "ま", "や", "ら", "わ", "ん"],
  // い段
  ["い", "き", "し", "ち", "に", "ひ", "み", null, "り", null, null],
  // う段
  ["う", "く", "す", "つ", "ぬ", "ふ", "む", "ゆ", "る", "を", null],
  // え段
  ["え", "け", "せ", "て", "ね", "へ", "め", null, "れ", null, null],
  // お段
  ["お", "こ", "そ", "と", "の", "ほ", "も", "よ", "ろ", null, null],
];

// Small kana variants for keys that have them
const SMALL_VARIANTS = {
  "あ": "ぁ", "い": "ぃ", "う": "ぅ", "え": "ぇ", "お": "ぉ",
  "や": "ゃ", "ゆ": "ゅ", "よ": "ょ",
  "つ": "っ",
};

// Dakuten mapping (清音 → 濁音)
const DAKUTEN_MAP = {
  "か": "が", "き": "ぎ", "く": "ぐ", "け": "げ", "こ": "ご",
  "さ": "ざ", "し": "じ", "す": "ず", "せ": "ぜ", "そ": "ぞ",
  "た": "だ", "ち": "ぢ", "つ": "づ", "て": "で", "と": "ど",
  "は": "ば", "ひ": "び", "ふ": "ぶ", "へ": "べ", "ほ": "ぼ",
};

// Handakuten mapping (清音 → 半濁音) — only for は行
const HANDAKUTEN_MAP = {
  "は": "ぱ", "ひ": "ぴ", "ふ": "ぷ", "へ": "ぺ", "ほ": "ぽ",
};

/**
 * Return the keyboard rows for a given sound mode and small toggle.
 * @param {"seion"|"dakuten"|"handakuten"} soundMode
 * @param {boolean} small
 * @returns {Array<Array<string|null>>} 5×11 grid
 */
export function getKeyboardRows(soundMode = "seion", small = false) {
  return KEYBOARD_ROWS.map(row =>
    row.map(base => {
      if (base === null) return null;
      // Small variant takes priority over sound substitution
      if (small && SMALL_VARIANTS[base]) {
        return SMALL_VARIANTS[base];
      }
      // Apply sound substitution
      if (soundMode === "dakuten" && DAKUTEN_MAP[base]) {
        return DAKUTEN_MAP[base];
      }
      if (soundMode === "handakuten" && HANDAKUTEN_MAP[base]) {
        return HANDAKUTEN_MAP[base];
      }
      return base;
    })
  );
}

/**
 * Cycle sound mode: seion → dakuten → handakuten → seion
 */
export function nextSoundMode(mode) {
  if (mode === "seion") return "dakuten";
  if (mode === "dakuten") return "handakuten";
  return "seion";
}

/**
 * Mount the keyboard into a container element.
 * @param {HTMLElement} container
 * @param {Object} handlers - {onKana(kana), onSubmit(), onDelete()}
 * @returns {{updateKeyStates(states: Map<string, 2|1|0>)}}
 */
export function mountKeyboard(container, handlers) {
  const { onKana, onSubmit, onDelete } = handlers;

  // Internal state
  let soundMode = "seion";
  let smallMode = false;
  const keyElements = new Map(); // kana -> button element

  // Create keyboard DOM
  const keyboard = document.createElement("nav");
  keyboard.className = "keyboard";
  keyboard.setAttribute("aria-label", "仮名キーボード");

  // Grid rows
  const grid = document.createElement("div");
  grid.className = "keyboard-grid";

  function renderGrid() {
    grid.innerHTML = "";
    const rows = getKeyboardRows(soundMode, smallMode);
    for (const row of rows) {
      const rowDiv = document.createElement("div");
      rowDiv.className = "keyboard-row";
      for (const cell of row) {
        if (cell === null) {
          const spacer = document.createElement("div");
          spacer.className = "key-spacer";
          rowDiv.appendChild(spacer);
        } else {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "key";
          btn.textContent = cell;
          btn.dataset.kana = cell;
          btn.addEventListener("click", () => onKana(cell));
          rowDiv.appendChild(btn);
          keyElements.set(cell, btn);
        }
      }
      grid.appendChild(rowDiv);
    }
  }

  // Action row (bottom): 削除, sound toggle, small toggle, 決定
  const actionRow = document.createElement("div");
  actionRow.className = "keyboard-actions";

  const delBtn = document.createElement("button");
  delBtn.type = "button";
  delBtn.className = "key key-action key-delete";
  delBtn.textContent = "削除";
  delBtn.addEventListener("click", onDelete);

  const soundBtn = document.createElement("button");
  soundBtn.type = "button";
  soundBtn.className = "key key-action key-toggle";
  soundBtn.dataset.mode = soundMode;
  soundBtn.addEventListener("click", () => {
    soundMode = nextSoundMode(soundMode);
    soundBtn.dataset.mode = soundMode;
    soundBtn.textContent = soundMode === "seion" ? "゛" : soundMode === "dakuten" ? "゜" : "清";
    renderGrid();
    updateKeyStatesDisplay();
  });

  const smallBtn = document.createElement("button");
  smallBtn.type = "button";
  smallBtn.className = "key key-action key-toggle";
  smallBtn.dataset.small = smallMode ? "true" : "false";
  smallBtn.textContent = "小";
  smallBtn.addEventListener("click", () => {
    smallMode = !smallMode;
    smallBtn.dataset.small = smallMode ? "true" : "false";
    renderGrid();
    updateKeyStatesDisplay();
  });

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "key key-action key-submit";
  submitBtn.textContent = "決定";
  submitBtn.addEventListener("click", onSubmit);

  actionRow.append(delBtn, soundBtn, smallBtn, submitBtn);

  keyboard.append(grid, actionRow);
  container.appendChild(keyboard);

  // Initial render
  renderGrid();

  // Public API
  function updateKeyStates(states) {
    // states: Map<kana, 2|1|0>
    for (const [kana, state] of states) {
      const btn = keyElements.get(kana);
      if (btn) {
        btn.dataset.state = state;
      }
    }
    // Also update keys that are currently displayed under toggles
    // (their displayed kana may differ from base)
    for (const [baseKana, btn] of keyElements) {
      if (!states.has(baseKana)) {
        // Check if current displayed character has a state
        const displayed = btn.textContent;
        if (states.has(displayed)) {
          btn.dataset.state = states.get(displayed);
        }
      }
    }
  }

  function updateKeyStatesDisplay() {
    // Re-evaluate all visible keys against states
    // This is called after toggle changes; the caller should call updateKeyStates again
    // but we can also refresh from a stored states map if provided.
  }

  return { updateKeyStates };
}