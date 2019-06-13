const params = new URL(window.location).searchParams;
if (params.get('contrast')) {
  document.body.classList.add('higher-contrast');
}

const leftBtn = document.getElementById('left');
const rightBtn = document.getElementById('right');
const defs = document.getElementById('definitions');
let stopLeaveEarly = null;
function leave(elem, dir) {
  const done = () => {
    console.log('yeet');
    stopLeaveEarly = null;
    elem.classList.remove('leaving-' + dir);
    elem.removeEventListener('animationend', done);
  };
  elem.classList.remove('showing-left');
  elem.classList.remove('showing-right');
  elem.addEventListener('animationend', done);
  elem.offsetWidth; // make browser recognize that the animation changed
  elem.classList.add('leaving-' + dir);
  elem.classList.remove('showing');
  stopLeaveEarly = done;
}
leftBtn.addEventListener('click', e => {
  if (stopLeaveEarly) stopLeaveEarly();
  const showingCard = document.querySelector('.showing');
  const newShowingCard = showingCard.previousElementSibling.tagName === 'BUTTON'
    ? defs.lastElementChild
    : showingCard.previousElementSibling;
  if (showingCard === newShowingCard) throw new Error('yikes');
  leave(showingCard, 'left');
  newShowingCard.classList.add('showing');
  newShowingCard.classList.add('showing-left');
});
rightBtn.addEventListener('click', e => {
  if (stopLeaveEarly) stopLeaveEarly();
  const showingCard = document.querySelector('.showing');
  const newShowingCard = showingCard.nextElementSibling || defs.children[2];
  if (showingCard === newShowingCard) throw new Error('yikes');
  leave(showingCard, 'right');
  newShowingCard.classList.add('showing');
  newShowingCard.classList.add('showing-right');
});

const html = document.documentElement;
const toReveal = Array.from(document.querySelectorAll('.reveal, .reveal-children > *'));
function reveal(stagger = false) {
  for (let i = toReveal.length; i--;) {
    const elem = toReveal[i];
    const rect = elem.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      toReveal.splice(i, 1);
      // also should prevent lag from page relayout
      setTimeout(() => {
        elem.classList.add('revealed');
      }, stagger ? rect.top / 2 : 0);
    }
  }
}
reveal(true);
const ad = document.getElementById('website-ad');
ad.style.bottom = (window.scrollY + window.innerHeight - html.scrollHeight) + 'px';
document.addEventListener('scroll', e => {
  reveal(false);
  ad.style.bottom = (window.scrollY + window.innerHeight - html.scrollHeight) + 'px';
});

const canvas = document.getElementById('background');
const c = canvas.getContext('2d');
let width, height, dpr, mx = -100, my = -100, showLight = true;
const shapeTypes = ['circle', 'square', 'triangle', 'cross'];
const SHAPE_LIFE_SPAN = 3000;
const RADIUS = 10;
let shapes;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  c.scale(dpr, dpr);
  c.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  c.lineWidth = 2;
  c.lineCap = 'round';
  c.lineJoin = 'round';
  shapes = [];
  for (let x = 0; x < width; x += RADIUS * 5) {
    for (let y = 0; y < height; y += RADIUS * 5) {
      shapes.push(newShape(x + Math.random() * RADIUS, y + Math.random() * RADIUS));
    }
  }
}
resize();
window.addEventListener('resize', resize);
document.addEventListener('mousemove', e => {
  mx = e.clientX;
  my = e.clientY;
});
document.addEventListener('touchstart', e => {
  mx = e.changedTouches[0].clientX;
  my = e.changedTouches[0].clientY;
  showLight = true;
});
document.addEventListener('touchmove', e => {
  mx = e.changedTouches[0].clientX;
  my = e.changedTouches[0].clientY;
});
document.addEventListener('touchend', e => {
  if (e.touches.length === 0) showLight = false;
});
function newShape(x, y) {
  return {
    type: shapeTypes[Math.random() * shapeTypes.length >> 0],
    rot: Math.random() * Math.PI * 2,
    x,
    y,
    clock: Math.random() * 1000 + 1500,
    circleRadius: RADIUS * (Math.random() * 2 + 2),
    rotspeed: Math.random() / 1000,
    opacity: 0
  };
}
function easeInQuint(t) {
  return t * t * t * t * t;
}
let lastTime = Date.now();
function paint() {
  if (shapes.length) {
    c.clearRect(0, 0, width, height);
    const now = Date.now();
    const elapsedTime = now - lastTime;
    lastTime = now;
    for (let i = shapes.length; i--;) {
      const shape = shapes[i];
      if (now - shape.start > SHAPE_LIFE_SPAN) {
        shapes.splice(i, 1);
      } else {
        // c.save();
        const opacity = showLight ? Math.max(1 - Math.hypot(shape.x - mx, shape.y - my) / 300, 0) : 0;
        shape.opacity += (opacity - shape.opacity) * (1 - (4 / 5) ** (elapsedTime / 15));
        if (Math.abs(shape.opacity) < 0.001) continue;
        c.globalAlpha = shape.opacity;
        const x = shape.x + Math.cos(now / shape.clock) * shape.circleRadius;
        const y = shape.y + Math.sin(now / shape.clock) * shape.circleRadius;
        const rot = shape.rot + shape.rotspeed * now;
        c.beginPath();
        let vertices;
        switch (shape.type) {
          case 'circle':
            c.arc(x, y, RADIUS, 0, 2 * Math.PI);
            break;
          case 'square': {
            const cos = Math.cos(rot) * RADIUS;
            const sin = Math.sin(rot) * RADIUS;
            c.moveTo(cos + x, sin + y);
            c.lineTo(sin + x, -cos + y);
            c.lineTo(-cos + x, -sin + y);
            c.lineTo(-sin + x, cos + y);
            c.closePath();
            break;
          }
          case 'triangle':
            c.moveTo(Math.cos(rot) * RADIUS + x, Math.sin(rot) * RADIUS + y);
            c.lineTo(Math.cos(rot + Math.PI * 2 / 3) * RADIUS + x, Math.sin(rot + Math.PI * 2 / 3) * RADIUS + y);
            c.lineTo(Math.cos(rot + Math.PI * 4 / 3) * RADIUS + x, Math.sin(rot + Math.PI * 4 / 3) * RADIUS + y);
            c.closePath();
            break;
          case 'cross': {
            const cos = Math.cos(rot) * RADIUS;
            const sin = Math.sin(rot) * RADIUS;
            c.moveTo(cos + x, sin + y);
            c.lineTo(-cos + x, -sin + y);
            c.moveTo(sin + x, -cos + y);
            c.lineTo(-sin + x, cos + y);
            c.closePath();
            break;
          }
        }
        c.stroke();
        // c.restore();
      }
    }
  }
  window.requestAnimationFrame(paint);
}
paint();

// remind myself what the tinyurl link is
console.log('TinyURL: https://tinyurl.com/seanpersonal');
