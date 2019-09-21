let controller = null;
function isDragTrigger(elem, ondown, ...fns) {
  elem.addEventListener('mousedown', e => {
    if (controller || e.which !== 1) return;
    controller = fns;
    if (ondown) ondown(e, newController => controller = newController);
  });
  return elem;
}
document.addEventListener('mousemove', e => {
  if (controller && controller[0]) controller[0](e);
});
document.addEventListener('mouseup', e => {
  if (controller) {
    let oldController = controller;
    controller = null;
    if (oldController[1]) {
      oldController[1](e, () => controller = oldController);
    }
  }
});

const ADJUST_HEIGHT = 100;
const MIN_DRAG_DIST = 5;
function isAdjustableInput(elem, onchange, oninput) {
  if (elem.type !== 'number') return elem;
  const RANGE = +elem.dataset.range;
  const DIGITS = +elem.dataset.digits;
  let initY, dragging, initVal;
  isDragTrigger(
    elem,
    ({clientY}) => {
      initY = clientY;
      dragging = false;
      initVal = +elem.value;
    },
    e => {
      if (!dragging) {
        if (Math.abs(e.clientY - initY) > MIN_DRAG_DIST) {
          dragging = true;
          elem.readOnly = true;
        }
      }
      if (dragging) {
        elem.value = (initVal + (initY - e.clientY) * RANGE / ADJUST_HEIGHT).toFixed(DIGITS);
        if (oninput) oninput();
        e.preventDefault();
      }
    },
    e => {
      if (dragging) {
        elem.readOnly = false;
        if (onchange) onchange();
      }
    }
  );
  return elem;
}

const beziers = {};

// time - [0, 1]
function interpolate(time, timingFn) {
  switch (timingFn) {
    case 'linear':
      return time;
    case 'constant':
      return 0;
    case 'easeInElastic':
    case 'easeOutElastic':
    case 'easeInOutElastic':
    case 'easeInBounce':
    case 'easeOutBounce':
    case 'easeInOutBounce':
      return easingsFunctions[timingFn](time);
    default:
      const id = timingFn.join('-');
      if (!beziers[id]) beziers[id] = BezierEasing(...timingFn);
      return beziers[id](time);
  }
}

// https://stackoverflow.com/a/17323608
function mod(n, m) {
  return ((n % m) + m) % m;
}

function clamp(val, min, max) {
  return Math.max(Math.min(val, max), min);
}
