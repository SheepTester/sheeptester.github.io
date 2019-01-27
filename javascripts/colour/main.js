const values = {
  // [min, max, viewY, viewX, name]
  'rgb.r': [0, 255, 'rgb.g', 'rgb.b', 'red'],
  'rgb.g': [0, 255, 'rgb.r', 'rgb.b', 'green'],
  'rgb.b': [0, 255, 'rgb.r', 'rgb.g', 'blue'],
  'hsl.h': [0, 360, 'hsl.l', 'hsl.s', 'hue'],
  'hsl.s': [0, 1, 'hsl.l', 'hsl.h', 'saturation'],
  'hsl.l': [0, 1, 'hsl.s', 'hsl.h', 'lightness'],
  'hsv.h': [0, 360, 'hsv.v', 'hsv.s', 'hue'],
  'hsv.s': [0, 1, 'hsv.v', 'hsv.h', 'saturation'],
  'hsv.v': [0, 1, 'hsv.s', 'hsv.h', 'value'],
  'lab.l': [0, 100, 'lab.b', 'lab.a', 'lightness'], // guessing
  'lab.a': [-128, 128, 'lab.l', 'lab.b', 'a*'],
  'lab.b': [-128, 128, 'lab.l', 'lab.a', 'b*'],
  'lch.l': [0, 150, 'lch.c', 'lch.h', 'lightness'],
  'lch.c': [0, 150, 'lch.l', 'lch.h', 'chroma'],
  'lch.h': [0, 360, 'lch.l', 'lch.c', 'hue'],
  'cmyk.c': [0, 1, 'cmyk.m', 'cmyk.y', 'cyan'],
  'cmyk.m': [0, 1, 'cmyk.c', 'cmyk.y', 'magenta'],
  'cmyk.y': [0, 1, 'cmyk.c', 'cmyk.m', 'yellow'],
  'cmyk.k': [0, 1, 'cmyk.c', 'cmyk.m', 'key'] // oofus
};
const boxCanvas = document.getElementById('box-canvas');
const bc = boxCanvas.getContext('2d');
const sliderCanvas = document.getElementById('slider-canvas');
const sc = sliderCanvas.getContext('2d');
sliderCanvas.width = 1;
let currentColour = chroma.random();
function render(sliderMode, canvasRes, options = {slider: true, box: true, handles: true}) {
  const [min, max, viewY, viewX] = values[sliderMode];
  if (options.slider) {
    sliderCanvas.height = canvasRes;
    for (let i = 0; i < canvasRes; i++) {
      sc.fillStyle = currentColour.set(sliderMode, (i * (max - min) / canvasRes + min)).hex('rgb');
      sc.fillRect(0, i, 1, 1);
    }
  }
  if (options.box) {
    boxCanvas.width = canvasRes;
    boxCanvas.height = canvasRes;
    for (let x = 0; x < canvasRes; x++) {
      for (let y = 0; y < canvasRes; y++) {
        bc.fillStyle = currentColour
          .set(viewX, (x * (values[viewX][1] - values[viewX][0]) / canvasRes + values[viewX][0]))
          .set(viewY, (y * (values[viewY][1] - values[viewY][0]) / canvasRes + values[viewY][0]))
          .hex('rgb');
        bc.fillRect(x, y, 1, 1);
      }
    }
  }
  if (options.handles) {
    sliderWrapper.style.setProperty('--y', (currentColour.get(sliderMode)
      - min) * 100 / (max - min) + '%');
    boxWrapper.style.setProperty('--x', (currentColour.get(viewX)
      - values[viewX][0]) * 100 / (values[viewX][1] - values[viewX][0]) + '%');
    boxWrapper.style.setProperty('--y', (currentColour.get(viewY)
      - values[viewY][0]) * 100 / (values[viewY][1] - values[viewY][0]) + '%');
  }
}
function slider(elemTrigger, callback, done) {
  let state = false, rect;
  function callCallback(x, y) {
    callback(Math.max(Math.min((x - rect.left) / rect.width, 1), 0),
      Math.max(Math.min((y - rect.top) / rect.height, 1), 0));
  }
  function onMove(e) {
    mousePos = state[0] ? e.touches[state[0]] : e;
    callCallback(mousePos.clientX, mousePos.clientY);
    e.preventDefault();
  }
  elemTrigger.addEventListener('touchstart', e => {
    if (!state) {
      state = [e.changedTouches[0].identifier];
      rect = elemTrigger.getBoundingClientRect();
      callCallback(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
      document.addEventListener('touchmove', onMove, {passive: true});
      document.addEventListener('touchend', e => {
        document.removeEventListener('touchmove', onMove);
        state = false;
        done();
        e.preventDefault();
      }, {passive: true, once: true});
    }
    e.preventDefault();
  }, {passive: true});
  elemTrigger.addEventListener('mousedown', e => {
    if (!state) {
      state = true;
      rect = elemTrigger.getBoundingClientRect();
      callCallback(e.clientX, e.clientY);
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', e => {
        document.removeEventListener('mousemove', onMove);
        state = false;
        done();
        e.preventDefault();
      }, {once: true});
    }
    e.preventDefault();
  });
}
let currentSlider, sliderState;
function setSlider(slider) {
  currentSlider = slider;
  sliderState = {
    baseColour: currentColour,
    sliderVal: currentColour.get(slider),
    xVal: currentColour.get(values[slider][3]),
    yVal: currentColour.get(values[slider][2])
  };
  if (isNaN(sliderState.sliderVal)) sliderState.sliderVal = 0;
  if (isNaN(sliderState.xVal)) sliderState.xVal = 0;
  if (isNaN(sliderState.yVal)) sliderState.yVal = 0;
  render(slider, 100);
}
const boxWrapper = document.getElementById('box-wrapper');
const sliderWrapper = document.getElementById('slider-wrapper');
slider(boxWrapper, (x, y) => {
  currentColour = sliderState.baseColour
    .set(currentSlider, sliderState.sliderVal)
    .set(values[currentSlider][3],
      sliderState.xVal = x * (values[values[currentSlider][3]][1]
        - values[values[currentSlider][3]][0])
        + values[values[currentSlider][3]][0])
    .set(values[currentSlider][2],
      sliderState.yVal = y * (values[values[currentSlider][2]][1]
        - values[values[currentSlider][2]][0])
        + values[values[currentSlider][2]][0]);
  boxWrapper.style.setProperty('--x', x * 100 + '%');
  boxWrapper.style.setProperty('--y', y * 100 + '%');
  render(currentSlider, 30, {slider: true});
}, () => {
  render(currentSlider, 100, {slider: true});
});
slider(sliderWrapper, (x, y) => {
  currentColour = sliderState.baseColour
    .set(currentSlider,
      sliderState.sliderVal = y * (values[currentSlider][1]
        - values[currentSlider][0])
        + values[currentSlider][0])
    .set(values[currentSlider][3], sliderState.xVal)
    .set(values[currentSlider][2], sliderState.yVal);
  sliderWrapper.style.setProperty('--y', y * 100 + '%');
  render(currentSlider, 30, {box: true});
}, () => {
  render(currentSlider, 100, {box: true});
});
setSlider('hsl.l');
render(currentSlider, 100);
