// detect if user is from l'sxafeto (TODO: use CSS and #from-sheep)
let revealClass = 'reveal-sheep';
if (window.location.search.slice(0, 11) === '?from=sheep') {
  window.history.replaceState({}, '', '/');
  revealClass = 'reveal-sheep-immediately';
}

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

document.addEventListener('DOMContentLoaded', e => {
  // return;
  const closeAboutBtn = document.getElementById('close-about');
  const titleElem = document.getElementById('title');
  const descElem = document.getElementById('desc');
  const openBtn = document.getElementById('open');
  const defaultTitle = titleElem.textContent;
  const defaultDesc = descElem.textContent;
  let selected = false;

  for (const link of document.getElementById('links').children) {
    const image = document.createElement('img');
    image.addEventListener('load', e => {
      image.classList.add('loaded');
    });
    image.src = link.dataset.image;
    link.appendChild(image);

    const title = link.querySelector('.name').textContent;
    const desc = link.querySelector('.desc').textContent;
    link.addEventListener('click', e => {
      if (link.classList.contains('selected')) {
        selected = false;
        link.classList.remove('selected');
        document.body.classList.remove('selected-link');
        titleElem.textContent = defaultTitle;
        descElem.textContent = defaultDesc;
        openBtn.style.backgroundImage = null;
      } else {
        if (selected) {
          selected.classList.remove('selected');
        }
        selected = link;
        link.classList.add('selected');
        document.body.classList.add('selected-link');
        titleElem.textContent = title;
        descElem.textContent = desc;
        openBtn.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${encodeURI(link.dataset.image)})`;
      }
      e.preventDefault();
    });
  }

  openBtn.addEventListener('click', e => {
    if (!selected) {
      document.body.classList.add('show-about');
      closeAboutBtn.disabled = false;
    }
  });
  closeAboutBtn.addEventListener('click', e => {
    document.body.classList.remove('show-about');
    closeAboutBtn.disabled = true;
  });
  return;
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
window.addEventListener('load', e => {
  return;
  document.body.classList.remove('blank');
  document.body.classList.remove(revealClass);
  document.body.addEventListener('transitionend', function transitionend(e) {
    if (e.target.tagName === 'SHEEP-BTN') {
      document.body.classList.remove('sheep-minimize');
      document.body.removeEventListener('transitionend', transitionend);
    }
  });
});
