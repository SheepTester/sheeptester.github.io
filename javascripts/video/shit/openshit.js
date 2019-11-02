'use strict';

const params = new URL(location).searchParams;
const censored = params.get('censored');
const warnBeforeClosing = !params.get('easy-reload');

const actions = {
  VIDEO_TYPE: 'change export type',
  VIDEO_WIDTH: 'change video width',
  VIDEO_HEIGHT: 'change video height',
  VIDEO_BITRATE: 'change export bitrate',
  VIDEO_FORMAT: 'change export format',
  SPLIT: 'split tracks',
  MOVE_UP: 'move layer up',
  MOVE_DOWN: 'move layer down',
  INSERT_ABOVE: 'insert layer above',
  INSERT_BELOW: 'insert layer below',
  DELETE_LAYER: 'delete layer',
  RANGE_DELETE: 'delete tracks in range',
  DUPLICATE: 'duplicate track',
  DELETE: 'delete track',
  MOVE_KEYS: 'move keys',
  TRIM: 'trim track',
  MOVE: 'move track',
  SPLIT: 'split track',
  REMOVE: 'delete track',
  PROP_CHANGE: 'change track property',
  EASE_CHANGE: 'change property easing function',
  KEY: 'add key',
  UNKEY: 'remove key',
  DELETE_KEYS: 'delete keys'
};

const loadBtn = document.getElementById('load');
const fileBtn = document.getElementById('file');
const helpBtn = document.getElementById('help');
const addBtn = document.getElementById('add');
const startBtn = document.getElementById('start');
const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const nextBtn = document.getElementById('next');
const textBtn = document.getElementById('text');
const rectBtn = document.getElementById('rect');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const zoomOutBtn = document.getElementById('out');
const zoomInBtn = document.getElementById('in');

const panelWrapper = document.getElementById('panel');
const propertiesList = document.getElementById('properties');
const playIcon = document.getElementById('icon');
const currentSpan = document.getElementById('current');
const lengthSpan = document.getElementById('length');

const scrollWrapper = document.getElementById('scroll');
const timeMarkers = document.getElementById('axis');
const layersWrapper = document.getElementById('layers');
const playheadMarker = document.getElementById('playhead');

const modalCover = document.getElementById('modal-cover');
const selectPreset = document.getElementById('select-preset');
const customSizeWrapper = document.getElementById('custom-size');
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const bitrateInput = document.getElementById('bitrate');
const selectEncode = document.getElementById('select-encode');
const goToTime = document.getElementById('time');

const preview = document.getElementById('preview');
const c = preview.getContext('2d');

const easingEditor = new EasingEditor();

let exportBitrate = 7.5;
const videoTypes = [
  // https://support.google.com/youtube/answer/1722171
  // https://support.google.com/youtube/answer/6375112
  {name: '2160p (4k) extreme', bitrate: 68, width: 3840, height: 2160},
  {name: '2160p (4k)', bitrate: 53, width: 3840, height: 2160},
  {name: '1440p (4k)', bitrate: 24, width: 2560, height: 1440},
  {name: '1080p', bitrate: 12, width: 1920, height: 1080},
  {name: '720p', bitrate: 7.5, width: 1280, height: 720},
  {name: '480p', bitrate: 4, width: 854, height: 480},
  {name: '360p', bitrate: 1.5, width: 640, height: 360},
  {name: '240p', bitrate: 1, width: 426, height: 240}
];
let currentVideoType = videoTypes[4];
function setVideoType(type, userChange = true) {
  if (type !== 'custom') {
    if (userChange) log(actions.VIDEO_TYPE);
    selectPreset.textContent = type.name;
    customSizeWrapper.classList.add('hidden');
    exportBitrate = type.bitrate;
    preview.width = type.width;
    preview.height = type.height;
    currentVideoType = type;
    rerender();
  }
  if (type === 'custom' || type.name === 'custom') {
    selectPreset.textContent = 'Custom';
    customSizeWrapper.classList.remove('hidden');
    bitrateInput.value = exportBitrate;
    widthInput.value = preview.width;
    heightInput.value = preview.height;
    currentVideoType = 'custom';
  }
}
const videoTypeMenu = new Menu(
  [...videoTypes.map(type => ({label: type.name, value: type})), {label: 'Custom', value: 'custom'}],
  setVideoType
);
selectPreset.parentNode.addEventListener('click', e => {
  const {left, bottom} = selectPreset.parentNode.getBoundingClientRect();
  videoTypeMenu.open(left, bottom);
});
widthInput.addEventListener('change', e => {
  const val = +widthInput.value;
  if (val > 0) {
    log(actions.VIDEO_WIDTH);
    preview.width = val;
    rerender();
  } else {
    widthInput.value = preview.width;
  }
});
heightInput.addEventListener('change', e => {
  const val = +heightInput.value;
  if (val > 0) {
    log(actions.VIDEO_HEIGHT);
    preview.height = val;
    rerender();
  } else {
    heightInput.value = preview.height;
  }
});
bitrateInput.addEventListener('change', e => {
  const val = +bitrateInput.value;
  if (val > 0) {
    log(actions.VIDEO_BITRATE);
    exportBitrate = val;
  } else {
    bitrateInput.value = exportBitrate;
  }
});
const exportTypes = [
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported
  'video/webm',
  'video/webm;codecs=vp8',
  'video/webm;codecs=daala',
  'video/webm;codecs=h264',
  'video/mpeg'
].filter(MediaRecorder.isTypeSupported);
let usingExportType = exportTypes[exportTypes.length - 1];
selectEncode.textContent = usingExportType;
const exportTypeMenu = new Menu(
  exportTypes.map(type => ({label: type, value: type})),
  type => {
    log(actions.VIDEO_FORMAT);
    selectEncode.textContent = type;
    usingExportType = type;
  }
);
selectEncode.parentNode.addEventListener('click', e => {
  const {left, bottom} = selectEncode.parentNode.getBoundingClientRect();
  exportTypeMenu.open(left, bottom);
});

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

isDragTrigger(document.getElementById('resize-panel'), null, ({clientX}) => {
  panelWrapper.style.width = clientX + 'px';
});
isDragTrigger(document.getElementById('resize-timeline'), null, ({clientY}) => {
  scrollWrapper.style.height = windowHeight - clientY + 'px';
});

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
    window.requestAnimationFrame(() => {
      previewTimeAt(Math.max((e.clientX + scrollX - LEFT) / scale, 0));
    });
  }
}, e => {
  previewTimeAt(Math.max((e.clientX + scrollX - LEFT) / scale, 0));
}, e => {
  if (wasPlaying) play();
});
const OFFSCREEN_PADDING = 20;
function setPreviewTime(time, scrollTo = true) {
  let wasPlaying = playing;
  if (wasPlaying) stop();
  previewTimeAt(time);
  if (scrollTo) {
    if (previewTime < (scrollX - LEFT + OFFSCREEN_PADDING) / scale
      || previewTime > (scrollX + windowWidth - LEFT - OFFSCREEN_PADDING) / scale) {
      scrollWrapper.scrollLeft = previewTime * scale - (windowWidth - LEFT) / 2;
    }
  }
  if (wasPlaying) play();
}
previewTimeAt(0);

addLayer();

isDragTrigger(textBtn, (e, switchControls) => {
  const track = new TextTrack();
  track.dragStart(e, [5, 5], true);
  switchControls([track.dragMove, track.dragEnd]);
});
isDragTrigger(rectBtn, (e, switchControls) => {
  const track = new RectTrack();
  track.dragStart(e, [5, 5], true);
  switchControls([track.dragMove, track.dragEnd]);
});

function importFiles(files) {
  return Promise.all(
    [...files].map(file => {
      const sourceType = toSource(file.type);
      if (sourceType) {
        const source = new sourceType(file);
        addBtn.parentNode.insertBefore(source.elem, addBtn);
        return source.ready;
      }
    })
  );
}
addBtn.addEventListener('change', async e => {
  addBtn.disabled = true;
  await importFiles(addBtn.files);
  addBtn.disabled = false;
  addBtn.value = null;
});
document.addEventListener('paste', e => {
  importFiles(e.clipboardData.files);
});
// https://css-tricks.com/drag-and-drop-file-uploading/
window.addEventListener('drop', e => {
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop#Process_the_drop
  const files = e.dataTransfer.items
    ? [...e.dataTransfer.items].filter(item => item.kind === 'file').map(item => item.getAsFile())
    : e.dataTransfer.files;
  if (files.length) {
    if (files[0].name.toLowerCase().endsWith('.oshit')) {
      loadFile(files[0]);
    } else {
      importFiles(files);
    }
  }
  e.preventDefault();
});
['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave'].forEach(eventType => {
  window.addEventListener(eventType, e => {
    e.preventDefault();
    e.stopPropagation();
  });
});

const undoHistory = [];
const redoHistory = [];
let saved = false;
function updateUndoButtons() {
  undoBtn.disabled = !undoHistory.length;
  undoBtn.title = undoHistory.length ? `undo ${undoHistory[0].message}` : null;
  redoBtn.disabled = !redoHistory.length;
  redoBtn.title = redoHistory.length ? `redo ${redoHistory[0].message}` : null;
}
function log(message, entry = getEntry()) {
  undoHistory.unshift({message, entry});
  redoHistory.splice(0, redoHistory.length);
  updateUndoButtons();
  saved = false;
}
undoBtn.addEventListener('click', e => {
  if (undoHistory.length) {
    const {message, entry} = undoHistory.shift();
    redoHistory.unshift({message, entry: getEntry()});
    setEntry(entry);
    updateUndoButtons();
  }
});
redoBtn.addEventListener('click', e => {
  if (redoHistory.length) {
    const {message, entry} = redoHistory.shift();
    undoHistory.unshift({message, entry: getEntry()});
    setEntry(entry);
    updateUndoButtons();
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

let currentModal = null;
function modal(modal) {
  const closeBtn = modal.querySelector('.close');
  closeBtn.addEventListener('click', e => {
    modalCover.classList.remove('show');
    modal.classList.remove('show');
    currentModal = null;
  });
  return () => {
    modalCover.classList.add('show');
    modal.classList.add('show');
    currentModal = closeBtn;
  };
}
modalCover.addEventListener('click', e => {
  if (currentModal && e.target === modalCover) currentModal.click();
});

const goToModal = modal(document.getElementById('go-to-modal'));
const goToMenu = new Menu([{label: 'Jump to time', fn() {
  goToModal();
  goToTime.value = previewTime;
  goToTime.focus();
}}]);
timeMarkers.addEventListener('contextmenu', e => {
  goToMenu.open(e.clientX, e.clientY);
});
goToTime.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const time = +goToTime.value;
    if (time >= 0) {
      setPreviewTime(time);
      currentModal.click();
    }
  } else if (e.key === 'Escape') {
    currentModal.click();
  }
});

document.addEventListener('keydown', e => {
  if (playing && playing.exporting) {
    if (e.key === 'Escape') playing.exporting(false);
    return;
  }
  if (e.target.tagName === 'INPUT') return;
  let preventDefault = true;
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
    } else if (e.key === 'x') {
      log(actions.SPLIT);
      layers.forEach(layer => {
        const track = layer.trackAt(previewTime);
        if (track) track.splitAt(previewTime - track.start, false);
      });
    } else {
      preventDefault = false;
    }
  } else if (e.key === 'ArrowLeft') {
    if (e.shiftKey) setPreviewTime(previewTime - 10);
    else if (e.altKey) setPreviewTime(previewTime - 0.1);
    else setPreviewTime(previewTime - 1);
  } else if (e.key === 'ArrowRight') {
    if (e.shiftKey) setPreviewTime(previewTime + 10);
    else if (e.altKey) setPreviewTime(previewTime + 0.1);
    else setPreviewTime(previewTime + 1);
  } else if (e.key === ' ') {
    playBtn.click();
  } else if (e.key === '-') {
    zoomOutBtn.click();
  } else if (e.key === '=' || e.key === '+') {
    zoomInBtn.click();
  } else if (e.key === 'Delete') {
    if (Track.selected) Track.deleteSelected();
  } else if (e.key === 'Escape') {
    if (currentModal) {
      currentModal.click();
    } else {
      preventDefault = false;
    }
  } else {
    preventDefault = false;
  }
  if (preventDefault) e.preventDefault();
});

const fileMenu = new Menu([
  {elem: Elem('label', {for: 'load'}, ['Open'])},
  {label: 'Save', fn: saveProject},
  {label: 'Video settings', fn: modal(document.getElementById('vid-settings-modal'))},
  {label: 'Export', fn: !censored && exportVideo}
]);
fileBtn.addEventListener('click', e => {
  const {left, bottom} = fileBtn.getBoundingClientRect();
  fileMenu.open(left, bottom);
});
const helpMenu = new Menu([
  {label: 'How to use', fn: modal(document.getElementById('help-modal'))},
  {label: 'Keyboard shortcuts', fn: modal(document.getElementById('shortcuts-modal'))},
  {label: 'About', fn: modal(document.getElementById('about-modal'))}
]);
helpBtn.addEventListener('click', e => {
  const {left, bottom} = helpBtn.getBoundingClientRect();
  helpMenu.open(left, bottom);
});

function saveProject() {
  fileMenu.items[1].disabled = true;
  const zip = new JSZip();
  zip.file('project.json', JSON.stringify({
    version: 1,
    entry: getEntry(),
    src: Object.values(sources).filter(({file}) => file)
  }));
  Object.values(sources).forEach(({id, file}) => {
    if (file) zip.file(id, file);
  })
  zip.generateAsync({type: 'blob'}).then(blob => {
    const url = URL.createObjectURL(blob);
    const saveLink = document.createElement('a');
    saveLink.href = url;
    saveLink.download = 'project.oshit';
    document.body.appendChild(saveLink);
    saveLink.click();
    document.body.removeChild(saveLink);
    URL.revokeObjectURL(url);
    fileMenu.items[1].disabled = false;
    saved = true;
  });
}
function loadFile(file) {
  return JSZip.loadAsync(file)
    .then(zip =>
      zip.file('project.json').async('text')
        .then(async json => {
          const {entry, src} = JSON.parse(json);
          addBtn.disabled = true;
          for (const {id, type} of src) {
            const blob = new Blob([await zip.file(id).async('arraybuffer')], {type});
            if (sources[id]) {
              console.warn('ignoring duplicate source ' + id);
            } else {
              sources[id] = new (toSource(type))(blob, id);
              addBtn.parentNode.insertBefore(sources[id].elem, addBtn);
              await sources[id].ready;
            }
          }
          addBtn.disabled = false;
          setEntry(entry);
          loadBtn.value = null;
          loadBtn.disabled = false;
        }));
}
loadBtn.addEventListener('change', e => {
  if (loadBtn.files[0]) {
    loadBtn.disabled = true;
    loadFile(loadBtn.files[0]).catch(e => {
      console.log(e);
      loadBtn.disabled = false;
    });
  }
});

if (warnBeforeClosing) {
  window.addEventListener('beforeunload', e => {
    if (!saved && (undoHistory.length || redoHistory.length)) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
}

document.addEventListener('contextmenu', e => {
  e.preventDefault();
});

if (censored) {
  document.body.classList.add('censored');
  fileMenu.items[3].disabled = true;
  window.history.replaceState({}, '', '../censored.html');
  document.title = '';
}
