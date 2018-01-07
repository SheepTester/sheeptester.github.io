function pixelateCanvas(context) {
  context.imageSmoothingEnabled = false;
  context.mozImageSmoothingEnabled = false;
  context.webkitImageSmoothingEnabled = false;
}
function getPixelAt(context, x, y, toString = false) {
  var [r, g, b, a] = context.getImageData(x, y, 1, 1).data;
  a /= 255;
  if (toString) return `rgba(${r}, ${g}, ${b}, ${a})`;
  else return {r: r, g: g, b: b, a: a};
}

document.addEventListener("DOMContentLoaded", e => {
  loadColours();
  loadTools();
}, false);
