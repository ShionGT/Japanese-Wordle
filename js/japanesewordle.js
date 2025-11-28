// hiragana
var hiraganas = new Map();
// あ行
hiraganas.set('a', 'あ');
hiraganas.set('i', 'い');
hiraganas.set('u', 'う');
hiraganas.set('e', 'え');
hiraganas.set('o', 'お');
// か行
hiraganas.set('ka', 'か');
hiraganas.set('ki', 'き');
hiraganas.set('ku', 'く');
hiraganas.set('ke', 'け');
hiraganas.set('ko', 'こ');
// さ行
hiraganas.set('sa', 'さ');
hiraganas.set('si', 'し');
hiraganas.set('su', 'す');
hiraganas.set('se', 'せ');
hiraganas.set('so', 'そ');
// た行
hiraganas.set('ta', 'た');
hiraganas.set('ti', 'ち');
hiraganas.set('chi', 'ち');
hiraganas.set('ci', 'ち');
hiraganas.set('tsu', 'つ');
hiraganas.set('tu', 'つ');
hiraganas.set('te', 'て');
hiraganas.set('to', 'と');
// な行
hiraganas.set('na', 'な');
hiraganas.set('ni', 'に');
hiraganas.set('nu', 'ぬ');
hiraganas.set('ne', 'ね');
hiraganas.set('no', 'の');
// は行
hiraganas.set('ha', 'は');
hiraganas.set('hi', 'ひ');
hiraganas.set('hu', 'ふ');
hiraganas.set('fu', 'ふ');
hiraganas.set('he', 'へ');
hiraganas.set('ho', 'ほ');
// ま行
hiraganas.set('ma', 'ま');
hiraganas.set('mi', 'み');
hiraganas.set('mu', 'む');
hiraganas.set('me', 'め');
hiraganas.set('mo', 'も');
// や行
hiraganas.set('ya', 'や');
hiraganas.set('yu', 'ゆ');
hiraganas.set('yo', 'よ');
// ら行
hiraganas.set('ra', 'ら');
hiraganas.set('ri', 'り');
hiraganas.set('ru', 'る');
hiraganas.set('re', 'れ');
hiraganas.set('ro', 'ろ');
// わ行
hiraganas.set('wa', 'わ');
hiraganas.set('wo', 'を');
hiraganas.set('nn', 'ん');
// が行
hiraganas.set('ga', 'が');
hiraganas.set('gi', 'ぎ');
hiraganas.set('gu', 'ぐ');
hiraganas.set('ge', 'げ');
hiraganas.set('go', 'ご');
// ざ行
hiraganas.set('za', 'ざ');
hiraganas.set('zi', 'じ');
hiraganas.set('ji', 'じ');
hiraganas.set('zu', 'ず');
hiraganas.set('ze', 'ぜ');
hiraganas.set('zo', 'ぞ');
// だ行
hiraganas.set('da', 'だ');
hiraganas.set('di', 'ぢ');
hiraganas.set('du', 'づ');
hiraganas.set('de', 'で');
hiraganas.set('do', 'ど');
// ば行
hiraganas.set('ba', 'ば');
hiraganas.set('bi', 'び');
hiraganas.set('bu', 'ぶ');
hiraganas.set('be', 'べ');
hiraganas.set('bo', 'ぼ');
// ぱ行
hiraganas.set('pa', 'ぱ');
hiraganas.set('pi', 'ぴ');
hiraganas.set('pu', 'ぷ');
hiraganas.set('pe', 'ぺ');
hiraganas.set('po', 'ぽ');
// 小文字
hiraganas.set('xa', 'ぁ');
hiraganas.set('xi', 'ぃ');
hiraganas.set('xu', 'ぅ');
hiraganas.set('xe', 'ぇ');
hiraganas.set('xo', 'ぉ');
hiraganas.set('xya', 'ゃ');
hiraganas.set('xyu', 'ゅ');
hiraganas.set('xyo', 'ょ');
hiraganas.set('xtu', 'っ');
hiraganas.set('xtsu', 'っ');

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


// generic fetch function
async function fetchData(filepath) {
  try {
    const response = await fetch(filepath);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching data:', error);
    return null;
  }
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
  } else if (strr.endsWith('a') || strr.endsWith('i') || strr.endsWith('u') || strr.endsWith('e') || strr.endsWith('o') || strr.endsWith('n')) {
    japchar = hiraganas.get(strr);
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
      length = previousField.value.length;
      previousField.setSelectionRange(length, length);
    }
  }

  if (answer && key === "Enter") {
    if (currentField.id.endsWith("fof")) {
      // user guesses here
      processGuess(currentField);
    }
  }
}

/**
 * gets the entire rows inputs
 * @param {*} className the name of class of the row
 * @param {*} groupPrefix the first chars of the string that points where the input is at
 * @returns the string from the entire row of inputs
 */
function getGroupInputs(className, groupPrefix) {
  const order = ['fi', 'se', 'th', 'fo', 'fv', 'sx', 'sv', 'ei']; // fi=1st, se=2nd, th=3rd, fo=4th, fv=5th

  // Build a regex like /^fv(fi|se|th|fo|fv)f$/
  const regex = new RegExp(`^${groupPrefix}(fi|se|th|fo|fv)f$`);

  // get all matching inputs
  const inputs = Array.from(document.querySelectorAll('.' + className))
    .filter(input => regex.test(input.id));

  // sort based on index in order array
  inputs.sort((a, b) => {
    const aKey = order.findIndex(k => a.id.includes(k));
    const bKey = order.findIndex(k => b.id.includes(k));
    return aKey - bKey;
  });

  return inputs.map(i => i.value);
}

/**
 * gets the random answer from a random JSON file
 * json file is selected based on a random hiragana character
 * @returns the answer
 */
async function getNewAnswer() {
  let answer = "";
  // create random values to select a random hiragana character
  let randomNum = Math.round(Math.random() * 70); // there are 71 hiragana characters
  console.log(hiraganaArray[70])
  while (hiraganaArray[randomNum] == 'づ' || hiraganaArray[randomNum] == 'を' || hiraganaArray[randomNum] == 'ん') { // no word start from 「づ」「を」「ん」
    randomNum = Math.round(Math.random() * 70); // there are 71 hiragana characters
  }

  // // testing logs
  // console.log(`Random Num: ${randomNum}`);

  // get the random hiragana character
  const randomHiragana = hiraganaArray[randomNum];
  console.log(`Selected JSON: json/katakana_data_${randomHiragana}行.json`);

  // update loading status
  document.getElementById("loadingstatus").innerText = "Initializing word list...";

  // fetch the data from the selected JSON file
  data = await fetchData(`json/katakana_data_${randomHiragana}行.json`).then((data) => {
    if (data) {
      d_len = data.length;
      console.log(`Loaded ${d_len} words from the file.`);

      // select a random answer from the loaded data
      loaded_load_array = data.map(item => item.kana);
      // console.log("loaded array: " + str(loaded_load_array));
      answer = loaded_load_array[Math.round(Math.floor(Math.random() * d_len))];
      answerKanji = data.find(item => item.kana == answer).word;
    }
  });
  // update loading status
  document.getElementById("loadingstatus").innerText = "File Loaded.";
  // out
  console.log("Answer selected: " + answer);
  return answer;
}


/**
 * writes and processes the user guess while keeping track of html
 * @param {*} currentField
 * @returns
 */
async function processGuess(currentField) {
  // get the group prefix from the current field id
  const order = ['fi', 'se', 'th', 'fo', 'fv', 'sx', 'sv', 'ei']; // fi=1st, se=2nd, th=3rd, fo=4th, fv=5th
  const groupPrefix = currentField.id.substring(0, 2); // e.g., 'fv' from 'fvfof'
  const userAnswer = await getGroupInputs(currentField.className, groupPrefix);

  console.log("Processing guess: " + userAnswer);

  // TODO: Add your logic to process the guess here

  // part of checking valid word
  isInvalidAnswer = false;
  const joinedUserAnswer = userAnswer.join('')

  // before locking, check is the word is valid
  data = await fetchData(`json/katakana_data_${userAnswer[0]}行.json`).then((data) => {
    if (data) {
      d_len = data.length;
      console.log(`Loaded ${d_len} words from the file.`);
      matchedWord = data.find(word => word.kana == joinedUserAnswer);
      // console.log(userAnswer + " matches with: " + matchedWord)
      if (!matchedWord) {
        isInvalidAnswer = true;
      } else {
        isInvalidAnswer = true;
      }
    }
  });

  if (isInvalidAnswer) {
    console.warn("Recived an invalid answer.")
    quickInvalidPopUp(1000)
    return;
  }


  const answerArray = answer.split("")

  const answerStatusArray = getCorrectionStateArray(answerArray, userAnswer);

  for (let i = 0; i < answerArray.length; i++) {
    // console.log(`Comparing userAnswer[${i}] = ${userAnswer[i]} with answerArray[${i}] = ${answerArray[i]}`);
    switch (answerStatusArray[i]) {
      case 1:
        // wrong position
        document.getElementById(groupPrefix + order[i] + 'f').style.backgroundColor = 'yellow';
        break;
      case 2:
        // correct position
        document.getElementById(groupPrefix + order[i] + 'f').style.backgroundColor = 'lightgreen';
        break;
      default:
        // not in answer
        document.getElementById(groupPrefix + order[i] + 'f').style.backgroundColor = 'lightgray';
        break;
    }
  }

  const isCorrect = answer == joinedUserAnswer;

  // lock input after submission keep at end
  const inputs = document.querySelectorAll('.' + currentField.className);
  inputs.forEach(input => {
    if (input.id.startsWith(groupPrefix)) {
      input.disabled = true;
    }
    const ordIndex = order.indexOf(groupPrefix) + 1;
    if (input.id.startsWith([order[ordIndex]]) && !isCorrect) {
      input.disabled = false;

      if (order.length <= ordIndex || ordIndex < 0) {
        showGameOver();
      }
    }
  });

  // when the answer is actually correct
  if (isCorrect) {
    showVictory()
  }
}


async function onLoad() {
  answer = await getNewAnswer();
  const inputs = document.querySelectorAll('.worrow');
  inputs.forEach(input => {
    if (input.id.startsWith('fi')) {
      input.disabled = false;
    } else {
      input.disabled = true;
    }
  })
  document.getElementsByClassName('.worrow').style = 'transiton: 1000ms all ease-in';
}

function closePopUp() {
  document.getElementById("gameoverpop").style.display = 'none';
  document.getElementById("victorypopup").style.display = 'none';
}

function showVictory() {
  setTimeout(function () {
    var popup = document.getElementById('victorypopup');
    popup.style.display = 'block';
    document.getElementById("victorypopupmsg").innerText = `正解！答えは「${answer}(${answerKanji})」でした！`
    document.getElementById("background").style.backgroundColor = 'lightgreen';
  }, 1000);
}

function showGameOver() {
  var popup = document.getElementById('gameoverpop');
  popup.style.display = 'block';
  document.getElementById("gameovermsg").innerText = `終了！答えは「${answer}(${answerKanji})」でした！`
}

function quickInvalidPopUp(delayMilliseconds) {
  var popup = document.getElementById('quickinvalidpop');
  popup.style.display = 'block'; // Show the popup
  setTimeout(function () {
    popup.style.display = 'none'; // Hide the popup after the delay
  }, delayMilliseconds);
}


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
  for (i = 0; i < answerList.length; i++) {
    if (guessList[i] === answerList[i]) {
      tempAns[i] = '2'
      res[i] = 2;
    }
  }
    for (i = 0; i < res.length; i++) {
      if (res[i] == 2) {
        continue;
      }
      for (j = 0; j < res.length; j++) {
        if (guessList[i] == tempAns[j]) {
          tempAns[j] = '1'
          res[i] = 1
        }
      }
    }
  // console.log(`temp=${temp} res=${res} guessList=${guessList} answerList=${answerList}`)
  return res;
}

// async function createKeyboards() {
//   const tableSection = document.getElementById('jp_preview_keyboard');
//   for (i = 0; i < hiraganaArray.length; i++) {
//     const id = hiraganaArray[i] + 'key';
//     tableSection.innerHTML += `<button id="${id}" onclick=typeKey("${id}")>${hiraganaArray[i]}</button>\n`;
//   }
// }

// function typeKey(inputID) {
//   const keyStr = hiraganaArray[i] + 'key';
//   key = document.getElementById(keyStr);

// }
