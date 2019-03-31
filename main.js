// detect if user is from l'sxafeto
let revealClass = 'reveal-sheep';
if (window.location.search.slice(0, 11) === '?from=sheep') {
  window.history.replaceState({}, '', '/');
  revealClass = 'reveal-sheep-immediately';
}

// ZALGIFY PAGE TITLE AFTER TIME
// characters from http://www.eeemo.net/
const upperDiacritics = '\u030d\u030e\u0304\u0305\u033f\u0311\u0306\u0310'
  + '\u0352\u0357\u0351\u0307\u0308\u030a\u0342\u0343\u0344\u034a\u034b\u034c'
  + '\u0303\u0302\u030c\u0350\u0300\u0301\u030b\u030f\u0312\u0313\u0314\u033d'
  + '\u0309\u0363\u0364\u0365\u0366\u0367\u0368\u0369\u036a\u036b\u036c\u036d'
  + '\u036e\u036f\u033e\u035b\u0346\u031a',
lowerDiacritics = '\u0316\u0317\u0318\u0319\u031c\u031d\u031e\u031f\u0320'
  + '\u0324\u0325\u0326\u0329\u032a\u032b\u032c\u032d\u032e\u032f\u0330\u0331'
  + '\u0332\u0333\u0339\u033a\u033b\u033c\u0345\u0347\u0348\u0349\u034d\u034e'
  + '\u0353\u0354\u0355\u0356\u0359\u035a\u0323',
midDiacritics = '\u0315\u031b\u0340\u0341\u0358\u0321\u0322\u0327\u0328\u0334'
  + '\u0335\u0336\u034f\u035c\u035d\u035e\u035f\u0360\u0362\u0338\u0337\u0361'
  + '\u0489';
function randInt(max) {
  return Math.floor(Math.random() * max);
}
function zalgify(text, intensity) {
  if (intensity < 1) {
    return text.split('').map(char => {
      if (randInt(1 / intensity) === 0) char += upperDiacritics[randInt(upperDiacritics.length)];
      if (randInt(1 / intensity) === 0) char += lowerDiacritics[randInt(lowerDiacritics.length)];
      return char;
    }).join('');
  } else {
    return text.split('').map(char => {
      const midDiacriticsCopy = midDiacritics.split('');
      for (let j = 0; j < intensity; j++)
        char += upperDiacritics[randInt(upperDiacritics.length)] + lowerDiacritics[randInt(lowerDiacritics.length)];
      for (let j = 0; j < intensity / 4 && j < midDiacritics.length; j++)
        char += midDiacriticsCopy.splice(randInt(midDiacriticsCopy.length), 1)[0];
      return char;
    }).join('');
  }
}
setTimeout(() => {
  let intensity = 0;
  function zalgoTitle() {
    if (intensity < 30) intensity++;
    document.title = zalgify('SheepTester', intensity / 10);
    setTimeout(zalgoTitle, 500 - intensity * 13);
  }
  zalgoTitle();
}, 60000);

// TAB KEY FOCUS
let tabFocus = false;
document.addEventListener('keydown', e => {
  if (e.keyCode === 9) {
    document.body.classList.add('tabkeyfocus');
    tabFocus = true;
  } else if (e.target.tagName === 'SPAN' && e.keyCode === 13) {
    e.target.click();
  }
});
document.addEventListener('keyup', e => {
  if (e.keyCode === 9) {
    tabFocus = false;
  }
});
document.addEventListener('focusin', e => {
  if (!tabFocus) {
    document.body.classList.remove('tabkeyfocus');
  }
});

// REGISTER SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

let sheepAppearTime;
document.addEventListener('DOMContentLoaded', e => {
  // MAKE SHEEP APPEAR
  window.requestAnimationFrame(() => {
    document.body.classList.add(revealClass);
    document.body.classList.add('sheep-minimize');
    sheepAppearTime = Date.now();
  });

  // MAKE GRID (as opposed to no-js list)
  document.body.classList.remove('list-view');
  Array.from(document.getElementsByClassName('placelist')).forEach(link => {
    link.className = 'place';
    const image = document.createElement('img');
    image.src = link.dataset.image;
    link.appendChild(image);
  });

  // UPDATE AGE DISPLAY
  const BIRTHDAY = 1049933280000;
  const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
  const msAge = document.getElementById('milliage');
  const yearAge = document.getElementById('yage');
  function displayAge() {
    const age = new Date().getTime() - BIRTHDAY;
    msAge.textContent = age;
    yearAge.textContent = (age / MS_PER_YEAR).toString().padEnd(18, '0');
    window.requestAnimationFrame(displayAge);
  }
  displayAge();
});

// SHEEP CAN HIDE NOW
window.addEventListener('load', e => {
  setTimeout(() => {
    document.body.classList.remove('blank');
    document.body.classList.remove(revealClass);
    setTimeout(() => {
      document.body.classList.remove('sheep-minimize');
    }, 500);
  }, sheepAppearTime + 500 - Date.now());
});
