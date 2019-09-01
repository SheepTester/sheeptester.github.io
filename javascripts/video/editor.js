'use strict';

class Menu {

  constructor(options) {
    this.elem = Elem('div', {
      className: 'context'
    }, options.map(([fn, label, icon]) => Elem('button', {
      className: 'context-item',
      onclick: e => {
        fn(this.target);
        this.close();
      }
    }, [
      Elem('i', {className: 'material-icons'}, [icon]),
      Elem('span', {}, [label])
    ])));
    document.addEventListener('click', e => {
      if (this.elem.parentNode) this.close();
    });
  }

  trigger(target, e) {
    const windowSize = [window.innerWidth, window.innerHeight];
    this.target = target;
    if (e) {
      if (e.clientX > windowSize[0] / 2) {
        this.elem.style.right = windowSize[0] - e.clientX + 'px';
      } else {
        this.elem.style.left = e.clientX + 'px';
      }
      if (e.clientY > windowSize[1] / 2) {
        this.elem.style.bottom = windowSize[1] - e.clientY + 'px';
      } else {
        this.elem.style.top = e.clientY + 'px';
      }
    }
    document.body.appendChild(this.elem);
  }

  close() {
    this.target = null;
    document.body.removeChild(this.elem);
    this.elem.style.left = null;
    this.elem.style.top = null;
    this.elem.style.right = null;
    this.elem.style.bottom = null;
  }

}

const sources = {};
const thumbnailCanvas = Elem('canvas');
const thumbnailContext = thumbnailCanvas.getContext('2d');
class Source {

  constructor(name) {
    this.onVideoLoad = this.onVideoLoad.bind(this);
    this.createClip = this.createClip.bind(this);

    this.name = name;
    sources[name] = this;
    this.sourceElem = Elem('div', {
      className: 'source disabled',
      onpointerdown: this.createClip
    }, [
      Elem('span', {className: 'name'}, [name])
    ]);
    sourceWrapper.insertBefore(this.sourceElem, addSource.parentNode);

    this.ready = new Promise(res => this.amReady = res);
  }

  attachFile(file) {
    this.file = file;
    this.video = URL.createObjectURL(file);
    preview.addEventListener('loadeddata', this.onVideoLoad);
    preview.src = this.video;
  }

  onVideoLoad() {
    if (preview.readyState < 2) return;
    preview.removeEventListener('loadeddata', this.onVideoLoad);
    preview.currentTime = preview.duration / 2;
    this.length = preview.duration;
    preview.addEventListener('timeupdate', e => {
      thumbnailCanvas.width = preview.videoWidth;
      thumbnailCanvas.height = preview.videoHeight;
      thumbnailContext.drawImage(preview, 0, 0, preview.videoWidth, preview.videoHeight);
      this.image = thumbnailCanvas.toDataURL();
      this.sourceElem.style.backgroundImage = `url(${encodeURI(this.image)})`;
      this.sourceElem.classList.remove('disabled');
      this.amReady();
    }, {once: true});
  }

  createClip(e) {
    if (recording) return;
    if (e.which === 1) {
      logThis();
      const rect = this.sourceElem.getBoundingClientRect();
      const clip = new Clip({src: this});
      clip.startDragging(e.clientX - rect.left, e.clientY - rect.top, e);
    } else if (e.which === 3) {
      console.log('menu');
    }
  }

}

const clipMenu = new Menu([
  [
    target => {
      const startStr = prompt(`Start time? (between 0–${target.src.length} seconds)`);
      const endStr = startStr && prompt(`End time? (between ${startStr}–${target.src.length} seconds)`);
      const start = +startStr;
      const end = +endStr;
      logThis();
      if (startStr && !isNaN(start) && start >= 0 && start < target.src.length) {
        target.start = start;
      }
      if (endStr && !isNaN(end) && end > target.start && end <= target.src.length) {
        target.end = end;
      }
      target.updateStartEndStyle();
      updateClips();
    },
    'Edit timings...',
    'crop'
  ],
  [
    target => {
      target.splitAt(target.cutPoint);
    },
    'Split here (enter)',
    'content_cut'
  ],
  [
    target => {
      const pointStr = prompt(`Where to split? (between ${target.start}–${target.end} seconds)`);
      const point = +pointStr;
      if (pointStr && !isNaN(point) && point > target.start && point < target.end) {
        target.splitAt(point);
      }
    },
    'Split at...',
    'content_cut'
  ],
  [
    target => {
      target.remove();
    },
    'Delete (delete)',
    'delete'
  ]
]);
class Clip {

  constructor({src, start = 0, end = null}) {
    this.dragMove = this.dragMove.bind(this);
    this.trimMove = this.trimMove.bind(this);

    this.src = typeof src === 'string' ? sources[src] || new Source(src) : src;
    this.start = start;
    this.end = end === null ? this.src.length : end;
    this.elem = Elem('div', {
      className: 'clip',
      onpointerdown: e => {
        if (recording) return;
        const rect = this.elem.getBoundingClientRect();
        if (e.which === 1) {
          logThis();
          if (e.target.classList.contains('trim-bar')) {
            this.startTrimming(e, e.target.classList.contains('left'));
          } else {
            clips.splice(this.clipIndex, 1);
            updateClips();
            this.startDragging(e.clientX - rect.left, e.clientY - rect.top, e);
          }
        } else if (e.which === 3) {
          this.cutPoint = (e.clientX - rect.left) / scale + this.start;
          clipMenu.trigger(this, e);
          movePlayhead((e.clientX + timelineScroll - 40) / scale);
        }
      }
    }, [
      Elem('div', {className: 'trim-bar left'}),
      Elem('span', {className: 'name'}, [this.src.name]),
      Elem('div', {className: 'trim-bar right'})
    ]);
    this.src.ready.then(() => {
      this.elem.style.backgroundImage = `url(${encodeURI(this.src.image)})`;
      this.elem.style.backgroundSize = this.src.length * scale + 'px';
    });
    this.updateStartEndStyle();
  }

  startDragging(diffX, diffY, e) {
    document.body.style.touchAction = 'none';
    previewMarker.classList.remove('hidden');
    this.dragData = [diffX, diffY];
    this.dragMove(e);
    this.elem.classList.add('dragging');
    document.body.appendChild(this.elem);

    document.addEventListener('pointermove', this.dragMove);
    document.addEventListener('pointerup', e => {
      document.body.style.touchAction = null;
      previewMarker.classList.add('hidden');
      this.dragData = null;
      this.elem.style.left = null;
      this.elem.style.top = null;
      this.elem.classList.remove('dragging');
      timelineWrapper.appendChild(this.elem);

      clips.splice(this.newIndex, 0, this);
      updateClips();
      document.removeEventListener('pointermove', this.dragMove);
    }, {once: true});
  }

  dragMove(e) {
    this.elem.style.left = e.clientX - this.dragData[0] + 'px';
    this.elem.style.top = e.clientY - this.dragData[1] + 'px';
    const pos = (e.clientX - this.dragData[0] + timelineScroll) / scale;
    let x = 0;
    for (let i = 0; i < clips.length; x += clips[i++].length) {
      if (pos < clips[i].length / 2 + x) {
        this.newIndex = i;
        previewMarker.style.setProperty('--pos', x * scale + 'px');
        return;
      }
    }
    this.newIndex = clips.length;
    previewMarker.style.setProperty('--pos', x * scale + 'px');
  }

  startTrimming(e, trimmingStart) {
    document.body.style.touchAction = 'none';
    this.initX = e.clientX + timelineScroll;
    this.initVal = trimmingStart ? this.start : this.end;
    this.trimmingStart = trimmingStart;

    document.addEventListener('pointermove', this.trimMove);
    document.addEventListener('pointerup', e => {
      document.body.style.touchAction = null;
      this.initX = null;
      this.initVal = null;
      this.trimmingStart = null;

      updateClips();
      movePlayhead(trimmingStart ? this.pos : this.pos + this.length);
      document.removeEventListener('pointermove', this.trimMove);
    }, {once: true});
  }

  trimMove(e) {
    const diff = (e.clientX + timelineScroll - this.initX) / scale;
    if (this.trimmingStart) {
      this.start = this.initVal + diff;
      if (this.start < 0) this.start = 0;
      if (this.start > this.end) this.start = this.end;
      this.elem.style.backgroundPosition = -this.start * scale + 'px';
      this.elem.style.setProperty('--pos', (this.pos + this.start - this.initVal) * scale + 'px');
      this.elem.style.setProperty('--length', this.length * scale + 'px');
      movePlayhead(this.pos + this.start - this.initVal);
    } else {
      this.end = this.initVal + diff;
      if (this.end < this.start) this.end = this.start;
      if (this.end > this.src.length) this.end = this.src.length;
      this.elem.style.setProperty('--length', this.length * scale + 'px');
      movePlayhead(this.pos + this.length);
    }
  }

  updateStartEndStyle() {
    this.elem.style.backgroundPosition = -this.start * scale + 'px';
    this.elem.style.setProperty('--length', this.length * scale + 'px');
  }

  splitAt(point, log = true) {
    if (log) logThis();
    const newClip = new Clip({
      src: this.src,
      start: point,
      end: this.end
    });
    clips.splice(this.clipIndex + 1, 0, newClip);
    timelineWrapper.appendChild(newClip.elem);
    this.end = point;
    this.updateStartEndStyle();
    updateClips();
  }

  remove(log = true) {
    if (log) logThis();
    clips.splice(this.clipIndex, 1);
    if (this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem);
    }
    updateClips();
  }

  get length() {
    return this.end - this.start;
  }

  toJSON() {
    return {
      src: this.src.name,
      start: this.start,
      end: this.end
    }
  }

}

const saveBtn = document.getElementById('save');
const loadBtn = document.getElementById('load');
const exportBtn = document.getElementById('export');
const sourceWrapper = document.getElementById('sources');
const addSource = document.getElementById('add');
const preview = document.getElementById('preview');
const toStartBtn = document.getElementById('start');
const prevBtn = document.getElementById('prev');
const playBtn = document.getElementById('play');
const playIcon = document.getElementById('icon');
const nextBtn = document.getElementById('next');
const currentTime = document.getElementById('current');
const lengthSpan = document.getElementById('length');
const undoBtn = document.getElementById('undo');
const redoBtn = document.getElementById('redo');
const zoomOutBtn = document.getElementById('out');
const zoomDisplay = document.getElementById('zoom')
const zoomInBtn = document.getElementById('in');
const timelineWrapper = document.getElementById('timeline');
const previewMarker = document.getElementById('marker');
const playhead = document.getElementById('playhead');

let playheadTime = 0, length = 0, currentIndex = null, playing = false, recording = false;

const clips = [];
const BASE_SCALE = 3;
const scales = [3, 6, 12, 24, 48, 96];
let scaleIndex = 0;
let scale = 3;
function updateScale() {
  clips.forEach(clip => {
    clip.elem.style.backgroundSize = clip.src.length * scale + 'px';
    clip.elem.style.backgroundPosition = -clip.start * scale + 'px';
    clip.elem.style.setProperty('--pos', clip.pos * scale + 'px');
    clip.elem.style.setProperty('--length', clip.length * scale + 'px');
  });
  movePlayhead(playheadTime, false);
  zoomDisplay.textContent = scale / BASE_SCALE + 'x';
}
function updateClips() {
  let t = 0;
  for (let i = 0; i < clips.length; t += clips[i++].length) {
    clips[i].clipIndex = i;
    clips[i].pos = t;
    clips[i].elem.style.setProperty('--pos', t * scale + 'px');
  }
  length = t;
  lengthSpan.textContent = Math.floor(t / 60) + ':'
    + Math.floor(t % 60).toString().padStart(2, '0');
    // + '.' + (t % 1).toFixed(3).slice(2);
  if (playheadTime > length) movePlayhead(length);
  else displayClipAt(playheadTime);
}
function displayClipAt(time) {
  if (clips.length) {
    for (let i = 0, t = 0; i < clips.length; t += clips[i++].length) {
      if (time < t + clips[i].length) {
        currentIndex = i;
        if (preview.src !== clips[i].src.video) {
          preview.src = clips[i].src.video;
        }
        preview.currentTime = clips[i].start + time - t;
        return;
      }
    }
    currentIndex = clips.length - 1;
    if (preview.src !== clips[currentIndex].src.video) {
      preview.src = clips[currentIndex].src.video
    }
    preview.currentTime = clips[currentIndex].end;
  } else {
    currentIndex = null;
    preview.src = null;
    stop();
  }
}
function movePlayhead(time, previewUpdate = true) {
  playheadTime = time;
  if (time < 0) time = 0;
  if (time > length) time = length;
  playhead.style.setProperty('--pos', time * scale + 'px');
  currentTime.textContent = Math.floor(time / 60) + ':'
    + Math.floor(time % 60).toString().padStart(2, '0');
  if (previewUpdate) displayClipAt(time);
}
function playheadFromPreview() {
  return clips[currentIndex].pos + preview.currentTime - clips[currentIndex].start;
}

preview.addEventListener('timeupdate', e => {
  if (currentIndex === null) return;
  if (playing && preview.currentTime > clips[currentIndex].end) {
    if (currentIndex === clips.length - 1) {
      stop();
    } else {
      if (recording) recorder.pause();
      currentIndex++;
      if (preview.src !== clips[currentIndex].src.video) {
        preview.src = clips[currentIndex].src.video
      }
      preview.currentTime = clips[currentIndex].start;
      if (recording) recorder.resume();
    }
  }
});
preview.addEventListener('loadeddata', e => {
  if (currentIndex === null) return;
  if (playing && preview.readyState >= 2 && preview.paused) {
    preview.currentTime = clips[currentIndex].start;
    preview.play();
    if (recording) recorder.resume();
  }
});
preview.addEventListener('ended', e => {
  if (currentIndex === null) return;
  if (playing) {
    if (currentIndex < clips.length - 1) {
      if (recording) recorder.pause();
      currentIndex++;
      if (preview.src !== clips[currentIndex].src.video) {
        preview.src = clips[currentIndex].src.video
      }
      preview.currentTime = clips[currentIndex].start;
      preview.play();
      if (recording) recorder.resume();
    } else {
      stop();
    }
  }
});
function positionPlayhead() {
  movePlayhead(playheadFromPreview(), false);
  if (playing) {
    window.requestAnimationFrame(positionPlayhead);
  }
}
function play() {
  if (currentIndex === null) return;
  if (playheadTime > length) movePlayhead(0);
  playing = true;
  playIcon.textContent = 'pause';
  preview.play();
  positionPlayhead();
}
function stop() {
  playing = false;
  playIcon.textContent = 'play_arrow';
  preview.pause();
  if (recording) recorder.stop();
}
playBtn.addEventListener('click', e => {
  if (playing) stop();
  else play();
});

toStartBtn.addEventListener('click', e => {
  movePlayhead(0);
});
prevBtn.addEventListener('click', e => {
  if (currentIndex === null) return;
  if (clips[currentIndex].start === preview.currentTime && currentIndex > 0) {
    currentIndex--;
  }
  movePlayhead(clips[currentIndex].pos);
});
nextBtn.addEventListener('click', e => {
  if (currentIndex === null) return;
  movePlayhead(clips[currentIndex].pos + clips[currentIndex].length);
});
zoomInBtn.addEventListener('click', e => {
  if (scaleIndex >= scales.length - 1) return;
  scale = scales[++scaleIndex];
  updateScale();
});
zoomOutBtn.addEventListener('click', e => {
  if (scaleIndex < 1) return;
  scale = scales[--scaleIndex];
  updateScale();
});
document.addEventListener('keydown', e => {
  if (recording) return;
  if (e.ctrlKey || e.metaKey) {
    if (e.key === 'ArrowLeft') {
      if (e.shiftKey) toStartBtn.click();
      else prevBtn.click();
    } else if (e.key === 'ArrowRight') {
      if (e.shiftKey) movePlayhead(length);
      else nextBtn.click();
    } else if (e.key === 'z') {
      undoBtn.click();
    } else if (e.key === 'Z' || e.key === 'Y') {
      redoBtn.click();
    }
  } else if (e.key === ' ') {
    playBtn.click();
  } else if (e.key === 'ArrowLeft') {
    movePlayhead(playheadTime - 1);
  } else if (e.key === 'ArrowRight') {
    movePlayhead(playheadTime + 1);
  } else if (e.key === 'Enter') {
    if (currentIndex !== null) {
      clips[currentIndex].splitAt(playheadTime - clips[currentIndex].pos + clips[currentIndex].start);
    }
  } else if (e.key === 'Delete') {
    if (currentIndex !== null) {
      clips[currentIndex].remove();
    }
  } else if (e.key === '-') {
    zoomOutBtn.click();
  } else if (e.key === '=' || e.key === '+') {
    zoomInBtn.click();
  }
});

let timelineScroll = timelineWrapper.scrollLeft;
timelineWrapper.addEventListener('scroll', e => {
  timelineScroll = timelineWrapper.scrollLeft;
});
let movingPlayhead = false;
timelineWrapper.addEventListener('pointerdown', e => {
  if (e.target.closest('.clip')) return;
  movingPlayhead = true;
  movePlayhead((e.clientX + timelineScroll - 40) / scale);
});
document.addEventListener('pointermove', e => {
  if (movingPlayhead) {
    movePlayhead((e.clientX + timelineScroll - 40) / scale);
  }
});
document.addEventListener('pointerup', e => {
  movingPlayhead = false;
});

addSource.addEventListener('change', async e => {
  addSource.disabled = true;
  addSource.parentNode.classList.add('disabled');
  for (const file of addSource.files) {
    const source = sources[file.name] || new Source(file.name);
    source.attachFile(file);
    await source.ready;
  }
  addSource.disabled = false;
  addSource.parentNode.classList.remove('disabled');
});

const undoHist = [];
const redoHist = [];
function getEntry() {
  const arr = clips.map(clip => clip.toJSON());
  arr.time = playheadTime;
  return arr;
}
function logThis() {
  undoHist.push(getEntry());
  undoBtn.disabled = false;
  redoBtn.disabled = true;
  redoHist.splice(0, redoHist.length);
}
function useEntry(entry) {
  clips.forEach(clip => timelineWrapper.removeChild(clip.elem));
  clips.splice(0, clips.length);
  clips.push(...entry.map(data => new Clip(data)));
  clips.forEach(clip => timelineWrapper.appendChild(clip.elem));
  updateClips();
  if (typeof entry.time === 'number') {
    movePlayhead(entry.time);
  }
}
undoBtn.addEventListener('click', e => {
  if (undoHist.length) {
    redoHist.push(getEntry());
    const entry = undoHist.pop();
    useEntry(entry);
    redoBtn.disabled = false;
    if (!undoHist.length) undoBtn.disabled = true;
  }
});
redoBtn.addEventListener('click', e => {
  if (redoHist.length) {
    undoHist.push(getEntry());
    const entry = redoHist.pop();
    useEntry(entry);
    undoBtn.disabled = false;
    if (!redoHist.length) redoBtn.disabled = true;
  }
});

function download(blob, name) {
  const saveLink = document.createElement('a');
  const url = window.URL.createObjectURL(blob);
  saveLink.href = url;
  saveLink.download = name;
  document.body.appendChild(saveLink);
  saveLink.click();
  document.body.removeChild(saveLink);
  window.URL.revokeObjectURL(url);
}

saveBtn.addEventListener('click', e => {
  download(new Blob([JSON.stringify(clips)], {type: 'application/json'}), 'smothered-rock-project.json');
});
loadBtn.addEventListener('change', e => {
  if (loadBtn.files[0]) {
    const reader = new FileReader();
    reader.onload = ({target: {result}}) => {
      logThis();
      useEntry(JSON.parse(result));
    };
    reader.readAsText(loadBtn.files[0]);
  }
});

let recorder;
exportBtn.addEventListener('click', e => {
  if (recording) {
    download(recording, 'exported-project.webm');
    return;
  }
  document.body.classList.add('recording');
  recording = true;
  [
    loadBtn,
    exportBtn,
    addSource,
    toStartBtn,
    prevBtn,
    playBtn,
    nextBtn,
    undoBtn,
    redoBtn
  ].forEach(btn => btn.disabled = true);
  recorder = new MediaRecorder(preview.captureStream(), {
    mimeType: 'video/webm;codecs=h264',
    videoBitsPerSecond: 8000000
  });
  recorder.addEventListener('dataavailable', e => {
    console.log(e.data);
    download(e.data, 'exported-project.webm');
    recording = e.data;
    exportBtn.disabled = false;
    exportBtn.focus();
  });
  recorder.start();
  movePlayhead(0);
  play();
});

// annoying thing to make the editor feel more like a native app
document.addEventListener('contextmenu', e => {
  e.preventDefault();
});
