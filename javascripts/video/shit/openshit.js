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

const scrollWrapper = document.getElementById('scroll');
const timingFunctions = document.getElementById('ease');
const timeMarkers = document.getElementById('axis');
const layersWrapper = document.getElementById('layers');
const playheadMarker = document.getElementById('playhead');

const preview = document.getElementById('preview');
const c = preview.getContext('2d');

const BASE_SCALE = 3;
const MAX_SCALE = 5;
let scale = 3, logScale = 0;
zoomOutBtn.addEventListener('click', e => {
  if (logScale > 0) {
    logScale--;
    scale = BASE_SCALE * 2 ** logScale;
    updateScale();
  }
});
zoomInBtn.addEventListener('click', e => {
  if (logScale < MAX_SCALE) {
    logScale++;
    scale = BASE_SCALE * 2 ** logScale;
    updateScale();
  }
});

let scrollX = scrollWrapper.scrollLeft, scrollY = scrollWrapper.scrollTop;
scrollWrapper.addEventListener('scroll', e => {
  scrollX = scrollWrapper.scrollLeft;
  scrollY = scrollWrapper.scrollTop;
  timingFunctions.style.left = scrollX + 'px';
});

Array.from(document.getElementsByClassName('value')).forEach(isAdjustableInput); // TEMP

addLayer();

isDragTrigger(textBtn, (e, switchControls) => {
  const track = new TextTrack(null);
  track.dragStart(e, [5, 5]);
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

document.addEventListener('contextmenu', e => {
  e.preventDefault();
});
