'use strict';

const saveBtn = document.getElementById('save');
const loadBtn = document.getElementById('load');
const exportBtn = document.getElementById('export');
const addBtn = document.getElementById('add');
const startBtn = document.getElementById('start');
const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const textBtn = document.getElementById('text');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const zoomOutBtn = document.getElementById('out');
const zoomInBtn = document.getElementById('in');

const propertiesList = document.getElementById('properties');
const playIcon = document.getElementById('icon');
const currentSpan = document.getElementById('current');
const lengthSpan = document.getElementById('length');

const scrollWrapper = document.getElementById('scroll');
const timeMarkers = document.getElementById('axis');
const layersWrapper = document.getElementById('layers');
const playheadMarker = document.getElementById('playhead');

const preview = document.getElementById('preview');
const c = preview.getContext('2d');

const easingEditor = new EasingEditor();

const LEFT = 100;

const BASE_SCALE = 3;
const MAX_SCALE = 5;
let logScale = 1, scale = BASE_SCALE * 2 ** logScale;
zoomOutBtn.addEventListener('click', e => {
  if (logScale > 0) {
    updateScale(BASE_SCALE * 2 ** --logScale);
  }
});
zoomInBtn.addEventListener('click', e => {
  if (logScale < MAX_SCALE) {
    updateScale(BASE_SCALE * 2 ** ++logScale);
  }
});
function renderScale() {
  while (timeMarkers.firstChild) timeMarkers.removeChild(timeMarkers.firstChild);
  const majorStep = 20 * 2 ** (-logScale);
  const step = 2 * 2 ** (-logScale);
  const minTime = Math.floor((scrollX - LEFT) / scale / step) * step;
  const maxTime = Math.ceil((scrollX + windowWidth) / scale / step) * step;
  for (let t = Math.max(minTime, 0); t <= maxTime; t += step) {
    timeMarkers.appendChild(Elem('span', {
      className: ['marker', t % majorStep === 0 ? 'major' : null],
      style: {
        left: t * scale + 'px'
      }
    }, [t % majorStep === 0 ? t + 's' : '']));
  }
}
window.requestAnimationFrame(renderScale);

let scrollX = scrollWrapper.scrollLeft, scrollY = scrollWrapper.scrollTop;
scrollWrapper.addEventListener('scroll', e => {
  scrollX = scrollWrapper.scrollLeft;
  scrollY = scrollWrapper.scrollTop;
  renderScale();
});

let windowWidth = window.innerWidth, windowHeight = window.innerHeight;
window.addEventListener('resize', e => {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  renderScale();
});

let previewTime, wasPlaying, editorLength;
isDragTrigger(scrollWrapper, (e, switchControls) => {
  const closest = e.target.closest('.track');
  if (closest && !closest.classList.contains('selected')) {
    switchControls(null);
  } else {
    if (playing) {
      wasPlaying = true;
      stop();
    } else {
      wasPlaying = false;
    }
    if (Track.selected && !closest) {
      Track.selected.unselected();
    }
    previewTimeAt(Math.max((e.clientX + scrollX - LEFT) / scale, 0));
  }
}, e => {
  previewTimeAt(Math.max((e.clientX + scrollX - LEFT) / scale, 0));
}, e => {
  if (wasPlaying) play();
});
function setPreviewTime(time) {
  let wasPlaying = playing;
  if (wasPlaying) stop();
  previewTimeAt(time);
  if (wasPlaying) play();
}
previewTimeAt(0);

addLayer();

isDragTrigger(textBtn, (e, switchControls) => {
  const track = new TextTrack();
  track.dragStart(e, [5, 5], true);
  switchControls([track.dragMove, track.dragEnd]);
});

addBtn.addEventListener('change', async e => {
  addBtn.disabled = true;
  for (const file of addBtn.files) {
    const source = toSource(file);
    if (source) {
      addBtn.parentNode.insertBefore(source.elem, addBtn);
      await source.ready;
    } else {
      console.log(file);
    }
  }
  addBtn.disabled = false;
});

const undoHistory = [];
const redoHistory = [];
function log(entry = getEntry()) {
  undoHistory.push(entry);
  redoHistory.splice(0, redoHistory.length);
  undoBtn.disabled = !undoHistory.length;
  redoBtn.disabled = !redoHistory.length;
}
undoBtn.addEventListener('click', e => {
  if (undoHistory.length) {
    redoHistory.push(getEntry());
    const entry = undoHistory.pop();
    setEntry(entry);
    undoBtn.disabled = !undoHistory.length;
    redoBtn.disabled = !redoHistory.length;
  }
});
redoBtn.addEventListener('click', e => {
  if (redoHistory.length) {
    undoHistory.push(getEntry());
    const entry = redoHistory.pop();
    setEntry(entry);
    undoBtn.disabled = !undoHistory.length;
    redoBtn.disabled = !redoHistory.length;
  }
});

playBtn.addEventListener('click', e => {
  if (playing) stop();
  else play();
});

startBtn.addEventListener('click', e => {
  setPreviewTime(0);
});
prevBtn.addEventListener('click', e => {
  const jumpPoints = getAllJumpPoints();
  const goodTime = jumpPoints.findIndex(t => t >= previewTime);
  if (goodTime === 0 || !jumpPoints.length) setPreviewTime(0);
  else if (~goodTime) setPreviewTime(jumpPoints[goodTime - 1]);
  else setPreviewTime(jumpPoints[jumpPoints.length - 1]);
});
nextBtn.addEventListener('click', e => {
  const jumpPoints = getAllJumpPoints();
  const goodTime = jumpPoints.find(t => t > previewTime);
  if (goodTime) setPreviewTime(goodTime);
});

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'ArrowLeft') {
      if (e.shiftKey) startBtn.click();
      else prevBtn.click();
    } else if (e.key === 'ArrowRight') {
      if (e.shiftKey) setPreviewTime(editorLength);
      else nextBtn.click();
    } else if (e.key === 'z') {
      undoBtn.click();
    } else if (e.key === 'Z' || e.key === 'y') {
      redoBtn.click();
    }
  } else if (e.key === 'ArrowLeft') {
    if (e.shiftKey) setPreviewTime(previewTime - 10);
    else if (e.altKey) setPreviewTime(previewTime - 0.1);
    else setPreviewTime(previewTime - 1);
    e.preventDefault();
  } else if (e.key === 'ArrowRight') {
    if (e.shiftKey) setPreviewTime(previewTime + 10);
    else if (e.altKey) setPreviewTime(previewTime + 0.1);
    else setPreviewTime(previewTime + 1);
    e.preventDefault();
  } else if (e.key === ' ') {
    playBtn.click();
  } else if (e.key === '-') {
    zoomOutBtn.click();
  } else if (e.key === '=' || e.key === '+') {
    zoomInBtn.click();
  }
});

document.addEventListener('contextmenu', e => {
  e.preventDefault();
});
