let controller = null;
function isDragTrigger(elem, ondown, ...fns) {
  elem.addEventListener('mousedown', e => {
    if (controller || e.which !== 1) return;
    controller = fns;
    ondown(e, newController => controller = newController);
  });
}
document.addEventListener('mousemove', e => {
  if (controller) controller[0](e);
});
document.addEventListener('mouseup', e => {
  if (controller) {
    controller[1](e);
    controller = null;
  }
});

const ADJUST_HEIGHT = 100;
const MIN_DRAG_DIST = 5;
function isAdjustableInput(elem) {
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
        e.preventDefault();
      }
    },
    e => {
      if (dragging) {
        elem.readOnly = false;
      }
    }
  );
}
