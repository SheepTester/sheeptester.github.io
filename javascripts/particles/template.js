const fullRot = 2 * Math.PI;
function drawDot(context, x, y, radius, colour) {
  context.fillStyle = colour;
  context.beginPath();
  context.arc(x, y, radius, 0, fullRot);
  context.fill();
}

document.addEventListener("DOMContentLoaded", e => {
  let canvas = document.querySelector('#canvas');
  if (canvas) {
    let context = canvas.getContext("2d"),
    pixelRatio = (window.devicePixelRatio || 1) // how should this be indented?
      / (context.webkitBackingStorePixelRatio
      || context.mozBackingStorePixelRatio
      || context.msBackingStorePixelRatio
      || context.oBackingStorePixelRatio
      || context.backingStorePixelRatio || 1),
    size = +document.body.dataset.size;

    if (!size) {
      size = 300;
      console.warn(`No data-size attribute found on body element; using default of ${size}.`);
    }

    canvas.width = pixelRatio * size;
    canvas.height = pixelRatio * size;
    canvas.style.width = canvas.style.height = size + "px";
    context.scale(pixelRatio, pixelRatio);

    canvas.addEventListener("click", e => {
      let boundingRect = canvas.getBoundingClientRect();
      if (window.addParticle) {
        window.addParticle(e.clientX - boundingRect.left, e.clientY - boundingRect.top);
      }
    }, false);
  } else throw new Error('No canvas with id "canvas" found.');
}, false);
