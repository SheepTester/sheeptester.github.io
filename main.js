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
  window.requestAnimationFrame(() => {
    document.body.classList.add('sheep-minimize');
    document.body.classList.remove('blank');
    document.body.addEventListener('transitionend', function transitionend(e) {
      if (e.target.tagName === 'SHEEP-BTN') {
        document.body.classList.remove('sheep-minimize');
        document.body.classList.remove('reveal-sheep');
        document.body.removeEventListener('transitionend', transitionend);
      }
    });
  });

  const sheepLetters = document.getElementById('happy');
  const letters = [{pos: 0, vel: 0}, {pos: 0, vel: 0}, {pos: 0, vel: 0}, {pos: 0, vel: 0}, {pos: 0, vel: 0}];
  let animating = false;
  function bounceLetters(args) {
    let stop = true;
    for (let i = 0; i < 5; i++) {
      const letter = letters[i];
      letter.vel = -letter.pos / 10 + letter.vel * 0.9;
      letter.pos += letter.vel;
      sheepLetters.children[i].style.transform = `translateY(${letter.pos}px)`;
      if (Math.abs(letter.vel) > 0.01 || Math.abs(letter.pos) > 0.01) stop = false;
    }
    if (stop) {
      animating = false;
      for (let i = 0; i < 5; i++) {
        sheepLetters.children[i].style.transform = null;
      }
    } else {
      window.requestAnimationFrame(bounceLetters);
    }
  }
  sheepLetters.addEventListener('mouseenter', e => {
    sheepLetters.click();
  });
  sheepLetters.addEventListener('click', e => {
    for (const letter of letters) {
      letter.vel += (Math.random() < 0.5 ? 1 : -1) * (Math.random() * 5 + 4);
    }
    if (!animating) {
      animating = true;
      bounceLetters();
    }
  });

  document.getElementById('toggle-view').addEventListener('click', e => {
    localStorage.setItem('preferences', document.body.classList.contains('grid-view') ? 'list' : 'grid');
    window.location.reload();
  });

  const tags = {};
  const filter = document.createElement('style');
  document.head.appendChild(filter);
  let selectedTag = null;
  for (const tag of document.querySelectorAll('span.tag')) {
    const tagID = tag.querySelector('span').className;
    const tagName = tag.textContent.trim();
    tags[tagID] = tagName;
    tag.tabIndex = 0;
    tag.setAttribute('role', 'button');
    tag.addEventListener('click', e => {
      if (tag === selectedTag) {
        tag.classList.remove('selected');
        filter.textContent = '';
        selectedTag = null;
      } else {
        if (selectedTag) {
          selectedTag.classList.remove('selected');
        }
        tag.classList.add('selected');
        filter.textContent = `.list a:not(.is-${tagID}) { display: none; }`;
        selectedTag = tag;
      }
    });
  }
  document.body.classList.add('interactive-tags');

  if (document.body.classList.contains('grid-view')) {
    const closeAboutBtn = document.getElementById('close-about');
    const titleElem = document.getElementById('title');
    const descElem = document.getElementById('desc');
    const openBtn = document.getElementById('open');
    const defaultTitle = titleElem.textContent;
    const defaultDesc = descElem.textContent;
    let selected = null;

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
        if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey || e.which !== 1
          || document.body.classList.contains('tabkeyfocus')) return;
        if (link.classList.contains('selected')) {
          selected = null;
          link.classList.remove('selected');
          document.body.classList.remove('selected-link');
          titleElem.textContent = defaultTitle;
          descElem.textContent = defaultDesc;
          openBtn.style.backgroundImage = null;
          openBtn.href = '#!';
        } else {
          if (selected) {
            selected.classList.remove('selected');
          }
          selected = link;
          link.classList.add('selected');
          document.body.classList.add('selected-link');
          titleElem.textContent = title;
          descElem.textContent = desc;
          openBtn.style.backgroundImage = `radial-gradient(circle, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.7)), url(${encodeURI(link.dataset.image)})`;
          openBtn.href = link.href;
        }
        e.preventDefault();
      });

      for (const tag of link.querySelector('.tags').children) {
        tag.title = tags[tag.className];
        link.classList.add('is-' + tag.className);
      }
    }

    openBtn.addEventListener('click', e => {
      if (!selected) {
        document.body.classList.add('show-about');
        closeAboutBtn.disabled = false;
        e.preventDefault();
      }
    });
    closeAboutBtn.addEventListener('click', e => {
      document.body.classList.remove('show-about');
      closeAboutBtn.disabled = true;
    });
  } else {
    for (const link of document.getElementById('links').children) {
      for (const tag of link.querySelector('.tags').children) {
        tag.title = tags[tag.className];
        link.classList.add('is-' + tag.className);
      }
    }
  }
});
