// detect if user is from l'sxafeto
var revealClass = 'reveal-sheep';
if (window.location.search.slice(0, 11) === '?from=sheep') {
  window.history.replaceState({}, '', '/');
  revealClass = 'reveal-sheep-immediately';
}

// ZALGIFY PAGE TITLE AFTER TIME
// characters from http://www.eeemo.net/
var upperDiacritics = '\u030d\u030e\u0304\u0305\u033f\u0311\u0306\u0310'
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
  var str = '';
  if (intensity < 1) {
    for (var i = 0; i < text.length; i++) {
      str += text[i];
      if (randInt(1 / intensity) === 0) str += upperDiacritics[randInt(upperDiacritics.length)];
      if (randInt(1 / intensity) === 0) str += lowerDiacritics[randInt(lowerDiacritics.length)];
    }
  } else {
    for (var i = 0; i < text.length; i++) {
      str += text[i];
      var midDiacriticsCopy = midDiacritics.split('');
      for (var j = 0; j < intensity; j++)
        str += upperDiacritics[randInt(upperDiacritics.length)] + lowerDiacritics[randInt(lowerDiacritics.length)];
      for (var j = 0; j < intensity / 4 && j < midDiacritics.length; j++)
        str += midDiacriticsCopy.splice(randInt(midDiacriticsCopy.length), 1)[0];
    }
  }
  return str;
}
setTimeout(function() {
  var intensity = 0;
  function zalgoTitle() {
    if (intensity < 30) intensity++;
    document.title = zalgify('SheepTester', intensity / 10);
    setTimeout(zalgoTitle, 500 - intensity * 13);
  }
  zalgoTitle();
}, 60000);

// TAB KEY FOCUS
var tabFocus = false;
document.addEventListener('keydown', function(e) {
  if (e.keyCode === 9) {
    document.body.classList.add('tabkeyfocus');
    tabFocus = true;
  } else if (e.target.tagName === 'SPAN' && e.keyCode === 13) {
    e.target.click();
  }
});
document.addEventListener('keyup', function(e) {
  if (e.keyCode === 9) {
    tabFocus = false;
  }
});
document.addEventListener('focusin', function(e) {
  if (!tabFocus) {
    document.body.classList.remove('tabkeyfocus');
  }
});

// REGISTER SERVICE WORKER
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}

document.addEventListener('DOMContentLoaded', function(e) {
  // MAKE SHEEP APPEAR
  window.requestAnimationFrame(function() {
    document.body.classList.add(revealClass);
    document.body.classList.add('sheep-minimize');
  });

  // MAKE GRID (as opposed to no-js list)
  document.body.classList.remove('list-view');
  var places = document.querySelectorAll('.places a');
  for (var i = 0; i < places.length; i++) {
    places[i].className = 'place';
    var wrapper = document.createElement('span');
    wrapper.className = 'place-box';
    var name = document.createElement('span');
    name.className = 'place-name';
    name.textContent = places[i].textContent;
    wrapper.appendChild(name);
    var image = document.createElement('img');
    image.src = places[i].dataset.image;
    wrapper.appendChild(image);
    places[i].textContent = '';
    places[i].appendChild(wrapper);
  }

  // UPDATE AGE DISPLAY
  var BIRTHDAY = 1049933280000;
  var MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
  var msAge = document.getElementById('milliage');
  var yearAge = document.getElementById('yage');
  function displayAge() {
    var age = new Date().getTime() - BIRTHDAY;
    msAge.textContent = age;
    var str = (age / MS_PER_YEAR).toString();
    while (str.length < 18) str += '0';
    yearAge.textContent = str;
    window.requestAnimationFrame(displayAge);
  }
  displayAge();

  var sheepLetters = document.getElementById('happy');
  var varters = [{pos: 0, vel: 0}, {pos: 0, vel: 0}, {pos: 0, vel: 0}, {pos: 0, vel: 0}, {pos: 0, vel: 0}];
  var animating = false;
  function bounceLetters(args) {
    var stop = true;
    for (var i = 0; i < 5; i++) {
      varters[i].vel = -varters[i].pos / 10 + varters[i].vel * 0.9;
      varters[i].pos += varters[i].vel;
      sheepLetters.children[i].style.transform = 'translateY(' + varters[i].pos + 'px)';
      if (Math.abs(varters[i].vel) > 0.01 || Math.abs(varters[i].pos) > 0.01) stop = false;
    }
    if (stop) {
      animating = false;
      for (var i = 0; i < 5; i++) {
        sheepLetters.children[i].style.transform = null;
      }
    }
    else window.requestAnimationFrame(bounceLetters);
  }
  sheepLetters.addEventListener('mouseenter', function(e) {
    sheepLetters.click();
  });
  sheepLetters.addEventListener('click', function(e) {
    for (var i = 0; i < 5; i++) {
      varters[i].vel += (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 5 + 4);
    }
    if (!animating) {
      animating = true;
      bounceLetters();
    }
  });
});

// SHEEP CAN HIDE NOW
window.addEventListener('load', function(e) {
  document.body.classList.remove('blank');
  document.body.classList.remove(revealClass);
  document.body.addEventListener('transitionend', function transitionend(e) {
    if (e.target.tagName === 'SHEEP-BTN') {
      document.body.classList.remove('sheep-minimize');
      document.body.removeEventListener('transitionend', transitionend);
    }
  });
});
