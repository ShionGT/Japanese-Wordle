// hiragana
var hiraganas = new Map();
// あ行
hiraganas.set("a", "あ");
hiraganas.set("i", "い");
hiraganas.set("u", "う");
hiraganas.set("e", "え");
hiraganas.set("o", "お");
// か行
hiraganas.set("ka", "か");
hiraganas.set("ki", "き");
hiraganas.set("ku", "く");
hiraganas.set("ke", "け");
hiraganas.set("ko", "こ");
// さ行
hiraganas.set("sa", "さ");
hiraganas.set("si", "し");
hiraganas.set("su", "す");
hiraganas.set("se", "せ");
hiraganas.set("so", "そ");
// た行
hiraganas.set("ta", "た");
hiraganas.set("ti", "ち");
hiraganas.set("chi", "ち");
hiraganas.set("ci", "ち");
hiraganas.set("tsu", "つ");
hiraganas.set("tu", "つ");
hiraganas.set("te", "て");
hiraganas.set("to", "と");
// な行
hiraganas.set("na", "な");
hiraganas.set("ni", "に");
hiraganas.set("nu", "ぬ");
hiraganas.set("ne", "ね");
hiraganas.set("no", "の");
// は行
hiraganas.set("ha", "は");
hiraganas.set("hi", "ひ");
hiraganas.set("hu", "ふ");
hiraganas.set("fu", "ふ");
hiraganas.set("he", "へ");
hiraganas.set("ho", "ほ");
// ま行
hiraganas.set("ma", "ま");
hiraganas.set("mi", "み");
hiraganas.set("mu", "む");
hiraganas.set("me", "め");
hiraganas.set("mo", "も");
// や行
hiraganas.set("ya", "や");
hiraganas.set("yu", "ゆ");
hiraganas.set("yo", "よ");
// ら行
hiraganas.set("ra", "ら");
hiraganas.set("ri", "り");
hiraganas.set("ru", "る");
hiraganas.set("re", "れ");
hiraganas.set("ro", "ろ");
// わ行
hiraganas.set("wa", "わ");
hiraganas.set("wo", "を");
hiraganas.set("nn", "ん");
// が行
hiraganas.set("ga", "が");
hiraganas.set("gi", "ぎ");
hiraganas.set("gu", "ぐ");
hiraganas.set("ge", "げ");
hiraganas.set("go", "ご");
// ざ行
hiraganas.set("za", "ざ");
hiraganas.set("zi", "じ");
hiraganas.set("ji", "じ");
hiraganas.set("zu", "ず");
hiraganas.set("ze", "ぜ");
hiraganas.set("zo", "ぞ");
// だ行
hiraganas.set("da", "だ");
hiraganas.set("di", "ぢ");
hiraganas.set("du", "づ");
hiraganas.set("de", "で");
hiraganas.set("do", "ど");
// ば行
hiraganas.set("ba", "ば");
hiraganas.set("bi", "び");
hiraganas.set("bu", "ぶ");
hiraganas.set("be", "べ");
hiraganas.set("bo", "ぼ");
// ぱ行
hiraganas.set("pa", "ぱ");
hiraganas.set("pi", "ぴ");
hiraganas.set("pu", "ぷ");
hiraganas.set("pe", "ぺ");
hiraganas.set("po", "ぽ");
// 小文字
hiraganas.set("xa", "ぁ");
hiraganas.set("xi", "ぃ");
hiraganas.set("xu", "ぅ");
hiraganas.set("xe", "ぇ");
hiraganas.set("xo", "ぉ");
hiraganas.set("xya", "ゃ");
hiraganas.set("xyu", "ゅ");
hiraganas.set("xyo", "ょ");
hiraganas.set("xtu", "っ");
hiraganas.set("xtsu", "っ");

/**
 * ・清音（46文字）: 50音表の基本となる「あいうえお」などの文字。
 * ・濁音（20文字）: 「が」「ぎ」「ぐ」「げ」「ご」「ざ」「じ」「ず」「ぜ」「ぞ」など。
 * ・半濁音（5文字）: 「ぱ」「ぴ」「ぷ」「ぺ」「ぽ」。
 * 合計: \(46+20+5=71\)文字。
 */

// initialize gloabal variables
var hiraganaArray = [...new Set(Array.from(hiraganas.values()))];
var answer = "";
var answerKanji = "";
// more initial variables
var rowCount = 0;
const maxLen = 4;

/* ==============================
     GENERIC FUNCTIONS
  ============================== */

const wordCache = new Map();

async function getWordList(hiragana) {
  if (!wordCache.has(hiragana)) {
    const data = await fetchData(`json/katakana_data_${hiragana}行.json`);
    wordCache.set(hiragana, data || []);
  }
  return wordCache.get(hiragana);
}

// generic fetch function
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

/* ==============================
     GET NEW ANSWER
  ============================== */
/**
 * gets the random answer from a random JSON file
 * json file is selected based on a random hiragana character
 * @returns the answer
 */
async function getNewAnswer() {
  let answer = "";
  // create random values to select a random hiragana character
  let randomNum = Math.round(Math.random() * 70); // there are 71 hiragana characters
  // console.log(hiraganaArray[70])
  while (
    hiraganaArray[randomNum] == "づ" ||
    hiraganaArray[randomNum] == "を" ||
    hiraganaArray[randomNum] == "ん"
  ) {
    // no word start from 「づ」「を」「ん」
    randomNum = Math.round(Math.random() * 70); // there are 71 hiragana characters
  }

  // // testing logs
  // console.log(`Random Num: ${randomNum}`);

  // get the random hiragana character
  const randomHiragana = hiraganaArray[randomNum];
  console.log(`Selected JSON: json/katakana_data_${randomHiragana}行.json`);

  // update loading status
  console.log("Initializing word list...");

  // fetch the data from the selected JSON file
  data = await getWordList(randomHiragana);

  if (data) {
    d_len = data.length;
    console.log(`Loaded ${d_len} words from the file.`);

    // select a random answer from the loaded data
    loaded_load_array = data.map((item) => item.kana);
    // console.log("loaded array: " + str(loaded_load_array));
    answer = loaded_load_array[Math.round(Math.floor(Math.random() * d_len))];
    answerKanji = data.find((item) => item.kana == answer).word;
  }

  // update loading status
  console.log("File Loaded.");
  // out
  console.log("Answer selected: " + answer);
  return answer;
}
/**
 * Function for to run at start. Is called by the html main page.
 */
async function onLoad() {
  answer = await getNewAnswer();
  createRow();
}

/* ==============================
     MOVE TO NEXT
  ============================== */

/**
 * minus one
 * @param {*} num the number to minus one
 * @returns the number after minus one, no change if too low
 */
function minusOne(num) {
  if (num <= 0) {
    return 0;
  }
  return num - 1;
}

/**
 * plus one
 * @param {*} num the number to plus one
 * @returns the number after plus one, no change if too high
 */
function plusOne(num) {
  return num < maxLen - 1 ? num + 1 : null;
}

/**
 * automatically moves to the next column if a japanese character is typed in
 * @param {*} currentField the current input field we are checking on
 * @param {*} nextField the next input field to move to
 */
function moveToNext(currentField, nextField) {
  const strr = currentField.value + "";
  currentField.value = currentField.value.trim();

  if (hiraganaArray.includes(strr) && nextField != null) {
    nextField.focus();
  } else if (
    strr.endsWith("a") ||
    strr.endsWith("i") ||
    strr.endsWith("u") ||
    strr.endsWith("e") ||
    strr.endsWith("o") ||
    strr.endsWith("n")
  ) {
    const japchar = hiraganas.get(strr);
    if (japchar != undefined) {
      currentField.value = japchar;
      if (nextField != null) {
        nextField.focus();
      }
    }
  }
}

/**
 * actions when the key is down
 * @param {*} event key event
 * @param {*} previousField the previous field for actions
 * @param {*} currentField the current field for getting inputs
 */
function onKeyDown(event, previousField, currentField) {
  const key = event.key;

  if (key === "Backspace" || key === "Delete") {
    if (previousField != null && currentField.value == "") {
      previousField.focus();
      const length = previousField.value.length;
      previousField.setSelectionRange(length, length);
    }
  }

  if (answer && key === "Enter") {
    if (currentField.id.endsWith(maxLen - 1)) {
      // user guesses here
      processGuess(currentField);
    }
  }
}

function createRow() {
  rowCount += 1;
  // the name of the class of the container
  const container = document.getElementById("main-table");
  // the div for the row
  const rowDiv = document.createElement("div");
  rowDiv.id = "row" + rowCount;
  rowDiv.className = "row";
  // the stuff inside the row
  for (let i = 0; i < maxLen; i++) {
    const input = document.createElement("input");
    input.type = "text";
    input.id = rowDiv.id + "cell" + i;
    input.className = "cell";
    input.maxLength = 3;
    input.addEventListener("input", () => {
      moveToNext(
        input,
        document.getElementById(rowDiv.id + "cell" + plusOne(i)),
      );
    });
    input.addEventListener("keydown", (event) => {
      onKeyDown(
        event,
        document.getElementById(rowDiv.id + "cell" + minusOne(i)),
        input,
      );
    });

    rowDiv.appendChild(input);
  }
  container.appendChild(rowDiv);
}

/* ==============================
     PROCESS GUESS METHOD
  ============================== */

/**
 * for some i, res[i] = 2 if correct, 1 if correct letter but incorrect spot, or 0 if incorrect
 * @param {*} answerList - the correct answer of the word in a list
 * @param {*} guessList  - the user's guess of the word in a list
 * @returns the organized list of arrays
 */
function getCorrectionStateArray(answerList, guessList) {
  // res is always propertional to user guess index
  let res = new Array(answerList.length);
  let tempAns = [...answerList];

  // console.log(`temp=${temp} res=${res} guessList=${guessList} answerList=${answerList}`)

  // logn search thru the words
  for (let i = 0; i < answerList.length; i++) {
    if (guessList[i] === answerList[i]) {
      tempAns[i] = "2";
      res[i] = 2;
    }
  }
  for (let i = 0; i < res.length; i++) {
    if (res[i] == 2) {
      continue;
    }
    for (let j = 0; j < res.length; j++) {
      if (guessList[i] === tempAns[j]) {
        tempAns[j] = "1";
        res[i] = 1;
        break;
      }
    }
  }
  // console.log(`temp=${temp} res=${res} guessList=${guessList} answerList=${answerList}`)
  return res;
}

/**
 * writes and processes the user guess while keeping track of html
 * @param {HTMLInputElement} currentField
 */
async function processGuess(currentField) {
  // extract row id (e.g. "row3" from "row3cell2")
  const rowId = currentField.id.match(/^row\d+/)[0];
  const row = document.getElementById(rowId);

  let inputs = Array.from(document.querySelectorAll("input"));
  // get all cells in this row, ordered by cell index
  inputs.sort((a, b) => a.dataset.index - b.dataset.index);

  const userAnswer = inputs.map((input) => input.value.trim());
  const joinedUserAnswer = userAnswer.join("");

  console.log("Processing guess:", joinedUserAnswer);

  /* ----------------------------
     VALID WORD CHECK
  ----------------------------- */

  let isInvalidAnswer = false;

  await fetchData(`json/katakana_data_${userAnswer[0]}行.json`).then((data) => {
    if (!data) return;
    const matchedWord = data.find((word) => word.kana === joinedUserAnswer);
    if (!matchedWord) {
      isInvalidAnswer = true;
    }
  });

  if (isInvalidAnswer) {
    console.warn("Received an invalid answer.");
    quickInvalidPopUp(1000);
    return;
  }

  /* ----------------------------
     CHECK CORRECTNESS
  ----------------------------- */

  const answerArray = answer.split("");
  const answerStatusArray = getCorrectionStateArray(answerArray, userAnswer);

  inputs.forEach((box, i) => {
    setTimeout(() => {
      switch (answerStatusArray[i]) {
        case 2:
          box.style.backgroundColor = "lightgreen"; // correct
          break;
        case 1:
          box.style.backgroundColor = "yellow"; // wrong position
          break;
        default:
          box.style.backgroundColor = "lightgray"; // not in answer
      }
    }, 500);
  });

  const isCorrect = joinedUserAnswer === answer;

  /* ----------------------------
     LOCK CURRENT ROW
  ----------------------------- */

  inputs.forEach((input) => (input.disabled = true));

  /* ----------------------------
     MOVE TO NEXT ROW / END GAME
  ----------------------------- */

  if (isCorrect) {
    showVictory();
    return;
  }

  // create next row and focus first cell
  createRow();
  document.querySelector(`#row${rowCount}cell0`).focus();
}

/***
 *
 ******** POP UP
 *
 * */

function closePopUp() {
  document.getElementById("victorypopup").style.display = "none";
}

function showVictory() {
  setTimeout(function () {
    var popup = document.getElementById("victorypopup");
    popup.style.display = "block";
    document.getElementById("victorypopupmsg").innerText =
      `正解！答えは「${answer}(${answerKanji})」でした！`;
    document.getElementById("background").style.backgroundColor = "lightgreen";
  }, 1000);
}

function quickInvalidPopUp(delayMilliseconds) {
  var popup = document.getElementById("quickinvalidpop");
  popup.style.display = "block"; // Show the popup
  setTimeout(function () {
    popup.style.display = "none"; // Hide the popup after the delay
  }, delayMilliseconds);
}
