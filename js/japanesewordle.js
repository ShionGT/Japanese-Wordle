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


/**
 * automatically moves to the next column if a japanese character is typed in
 * @param {*} currentField the current input field we are checking on
 * @param {*} nextField the next input field to move to
 */
function moveToNext(previousField, currentField, nextField) {

    if (currentField.value == "") {
        previousField.focus()
        return;
    }

    const strr = currentField.value + "";
    if (strr.endsWith('a') || strr.endsWith('i') || strr.endsWith('u') || strr.endsWith('e') || strr.endsWith('o') || strr.endsWith('n')) {
        japchar = hiraganas.get(strr);
        if (japchar != undefined) {
            currentField.value = japchar;
            if (nextField != currentField) {
                nextField.value = "";
            }
            nextField.focus();
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


function collectAnswers(className) {
  // Get all elements with class '.clas-name'
  const inputs = document.querySelectorAll('.' + className);

  // Convert NodeList to array and extract values
  const values = Array.from(inputs).map(input => input.value);

  // Join or process as needed
  const answer = values.join('');
  console.log(answer);

  // Example: return or use it in other logic
  return answer;
}

