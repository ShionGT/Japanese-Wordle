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

var answer = "";

/**
 * automatically moves to the next column if a japanese character is typed in
 * @param {*} currentField the current input field we are checking on
 * @param {*} nextField the next input field to move to
 */
function moveToNext(currentField, nextField) {
  const strr = currentField.value + "";
  currentField.value = currentField.value.trim();

  if (strr.endsWith('a') || strr.endsWith('i') || strr.endsWith('u') || strr.endsWith('e') || strr.endsWith('o') || strr.endsWith('n')) {
    japchar = hiraganas.get(strr);
    if (japchar != undefined) {
      currentField.value = japchar;
      if (nextField != null) {
        nextField.focus();
      }
    }
  }
}

function onKeyDown(event, previousField, currentField) {
  const key = event.key;

  if (key === "Backspace" || key === "Delete") {
    if (previousField != null && currentField.value == "") {
      previousField.focus();
      length = previousField.value.length;
      previousField.setSelectionRange(length, length);
    }
  }

  if (key === "Enter") {
    if (currentField.id.endsWith("fof")) {
      // user guesses here
      processGuess(currentField);
    }
  }
}


function getGroupInputs(className, groupPrefix) {
  const order = ['fi', 'se', 'th', 'fo', 'fv']; // fi=1st, se=2nd, th=3rd, fo=4th, fv=5th

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

// TODO: set the answer here
function getAnswerAsArray() {
  answer = "さくらい"; // example answer
  return answer.split('');
}



// TODO: write logic to process the guess
function processGuess(currentField) {
  // get the group prefix from the current field id
  const order = ['fi', 'se', 'th', 'fo', 'fv']; // fi=1st, se=2nd, th=3rd, fo=4th, fv=5th
  const groupPrefix = currentField.id.substring(0, 2); // e.g., 'fv' from 'fvfof'
  const userAnswer = getGroupInputs(currentField.className, groupPrefix).join('');

  console.log("Processing guess: " + userAnswer);

  // Add your logic to process the guess here
  // Add your logic to process the guess here
  // Add your logic to process the guess here
  // Add your logic to process the guess here
  // Add your logic to process the guess here
  // Add your logic to process the guess here
  // Add your logic to process the guess here
  // Add your logic to process the guess here
  // Add your logic to process the guess here
  // Add your logic to process the guess here

  const answerArray = getAnswerAsArray();

  for (let i = 0; i < userAnswer.length; i++) {
    if (userAnswer[i] === answerArray[i]) {
      // correct position
      document.getElementById(groupPrefix + order[i] + 'f').style.backgroundColor = 'lightgreen';
    } else if (answerArray.includes(userAnswer[i])) {
      // wrong position
      document.getElementById(groupPrefix + order[i] + 'f').style.backgroundColor = 'yellow';
    } else {
      // not in answer
      document.getElementById(groupPrefix + order[i] + 'f').style.backgroundColor = 'lightgray';
    }
  }

  // lock input after submission keep at end
  const inputs = document.querySelectorAll('.' + currentField.className);
  inputs.forEach(input => {
    if (input.id.startsWith(groupPrefix)) {
      input.disabled = true;
    }
  });
}


