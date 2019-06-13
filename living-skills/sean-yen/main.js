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

const ad = document.getElementById('website-ad');
const html = document.documentElement;
ad.style.bottom = (html.scrollTop + window.innerHeight - html.scrollHeight) + 'px';
document.addEventListener('scroll', e => {
  ad.style.bottom = (html.scrollTop + window.innerHeight - html.scrollHeight) + 'px';
});

const canvas = document.getElementById('background');
const c = canvas.getContext('2d');
let width, height, dpr;
function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  c.scale(dpr, dpr);
  c.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  c.lineWidth = 2;
  c.lineCap = 'round';
  c.lineJoin = 'round';
}
resize();
window.addEventListener('resize', resize);
const shapes = [];
const shapeTypes = ['circle', 'square', 'triangle', 'cross'];
const SHAPE_LIFE_SPAN = 3000;
const RADIUS = 10;
function newShape(y: Math.random() * height, yvel = 0, rotvel = 0) {
  return {
    type: shapeTypes[Math.random() * shapeTypes.length >> 0],
    rot: Math.random() * Math.PI * 2,
    rotvel,
    x: Math.random() * width,
    y,
    yvel,
    start: Date.now()
  };
}
function easeInQuint(t) {
  return t * t * t * t * t;
}
function paint() {
  if (shapes.length) {
    c.clearRect(0, 0, width, height);
    const now = Date.now();
    for (let i = shapes.length; i--;) {
      const shape = shapes[i];
      if (now - shape.start > SHAPE_LIFE_SPAN) {
        shapes.splice(i, 1);
      } else {
        // c.save();
        const opacity = 1 - easeInQuint((now - shape.start) / SHAPE_LIFE_SPAN);
        c.globalAlpha = opacity;
        c.beginPath();
        let vertices;
        switch (shape.type) {
          case 'circle':
            c.arc(shape.x, shape.y, RADIUS, 0, 2 * Math.PI);
            break;
          case 'square': {
            const cos = Math.cos(shape.rot) * RADIUS;
            const sin = Math.sin(shape.rot) * RADIUS;
            c.moveTo(cos + shape.x, sin + shape.y);
            c.lineTo(sin + shape.x, -cos + shape.y);
            c.lineTo(-cos + shape.x, -sin + shape.y);
            c.lineTo(-sin + shape.x, cos + shape.y);
            c.closePath();
            break;
          }
          case 'triangle':
            c.moveTo(Math.cos(shape.rot) * RADIUS + shape.x, Math.sin(shape.rot) * RADIUS + shape.y);
            c.lineTo(Math.cos(shape.rot + Math.PI * 2 / 3) * RADIUS + shape.x, Math.sin(shape.rot + Math.PI * 2 / 3) * RADIUS + shape.y);
            c.lineTo(Math.cos(shape.rot + Math.PI * 4 / 3) * RADIUS + shape.x, Math.sin(shape.rot + Math.PI * 4 / 3) * RADIUS + shape.y);
            c.closePath();
            break;
          case 'cross': {
            const cos = Math.cos(shape.rot) * RADIUS;
            const sin = Math.sin(shape.rot) * RADIUS;
            c.moveTo(cos + shape.x, sin + shape.y);
            c.lineTo(-cos + shape.x, -sin + shape.y);
            c.moveTo(sin + shape.x, -cos + shape.y);
            c.lineTo(-sin + shape.x, cos + shape.y);
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
window.addEventListener('wheel', e => {
  if (e.deltaY === 0) return;
  const shapeCount = Math.abs(Math.round(e.deltaY / 10));
  for (let i = 0; i < shapeCount; i++) {
    shapes.push(newShape(e.deltaY < 0 ? -RADIUS : height + RADIUS, -e.deltaY / (90 + Math.random() * 100)));
  }
});
