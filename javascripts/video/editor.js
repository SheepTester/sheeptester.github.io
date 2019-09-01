const thumbnailCanvas = Elem('canvas');
const thumbnailContext = thumbnailCanvas.getContext('2d');
class Source {

  constructor(name) {
    this.onVideoLoad = this.onVideoLoad.bind(this);
    this.createClip = this.createClip.bind(this);

    this.name = name;
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
    const rect = this.sourceElem.getBoundingClientRect();
    const clip = new Clip(this);
    clip.startDragging(e.clientX - rect.left, e.clientY - rect.top, e);
  }

}

class Clip {

  constructor(src) {
    this.dragMove = this.dragMove.bind(this);
    this.trimMove = this.trimMove.bind(this);

    this.src = src;
    this.start = 0;
    this.end = src.length;
    this.elem = Elem('div', {
      className: 'clip',
      style: {
        '--length': this.length * scale + 'px',
        backgroundImage: `url(${encodeURI(src.image)})`,
        backgroundSize: this.length * scale + 'px',
        backgroundPosition: 0
      },
      onpointerdown: e => {
        if (e.target.classList.contains('trim-bar')) {
          this.startTrimming(e, e.target.classList.contains('left'));
        } else {
          const rect = this.elem.getBoundingClientRect();
          clips.splice(this.clipIndex, 1);
          updateClips();
          this.startDragging(e.clientX - rect.left, e.clientY - rect.top, e);
        }
      }
    }, [
      Elem('div', {className: 'trim-bar left'}),
      Elem('span', {className: 'name'}, [src.name]),
      Elem('div', {className: 'trim-bar right'})
    ]);
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

  get length() {
    return this.end - this.start;
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
const zoomOutBtn = document.getElementById('out');
const zoomDisplay = document.getElementById('zoom')
const zoomInBtn = document.getElementById('in');
const timelineWrapper = document.getElementById('timeline');
const previewMarker = document.getElementById('marker');
const playhead = document.getElementById('playhead');

let playheadTime = 0, length = 0, currentIndex = null, playing = false;

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
  displayClipAt(playheadTime);
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
    currentClip = null;
    preview.src = null;
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
  if (playing && preview.currentTime > clips[currentIndex].end) {
    if (currentIndex === clips.length - 1) {
      stop();
    } else {
      currentIndex++;
      if (preview.src !== clips[currentIndex].src.video) {
        preview.src = clips[currentIndex].src.video
      }
      preview.currentTime = clips[currentIndex].start;
    }
  }
});
preview.addEventListener('loadeddata', e => {
  if (playing && preview.readyState >= 2 && preview.paused) {
    preview.currentTime = clips[currentIndex].start;
    preview.play();
  }
});
preview.addEventListener('ended', e => {
  if (playing) stop();
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
}
playBtn.addEventListener('click', e => {
  if (playing) stop();
  else play();
});

toStartBtn.addEventListener('click', e => {
  movePlayhead(0);
});
prevBtn.addEventListener('click', e => {
  if (clips[currentIndex].start === preview.currentTime && currentIndex > 0) {
    currentIndex--;
  }
  movePlayhead(clips[currentIndex].pos);
});
nextBtn.addEventListener('click', e => {
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
  if (e.key === ' ') {
    playBtn.click();
  } else if (e.key === 'ArrowLeft') {
    if (e.ctrlKey || e.metaKey) {
      if (e.shiftKey) toStartBtn.click();
      else prevBtn.click();
    }
    else movePlayhead(playheadTime - 1);
  } else if (e.key === 'ArrowRight') {
    if (e.ctrlKey || e.metaKey) {
      if (e.shiftKey) movePlayhead(length);
      else nextBtn.click();
    }
    else movePlayhead(playheadTime + 1);
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
timelineWrapper.addEventListener('pointermove', e => {
  if (movingPlayhead) {
    movePlayhead((e.clientX + timelineScroll - 40) / scale);
  }
});
timelineWrapper.addEventListener('pointerup', e => {
  movingPlayhead = false;
});

addSource.addEventListener('change', async e => {
  addSource.disabled = true;
  addSource.parentNode.classList.add('disabled');
  for (const file of addSource.files) {
    const source = new Source(file.name);
    source.attachFile(file);
    await source.ready;
  }
  addSource.disabled = false;
  addSource.parentNode.classList.remove('disabled');
});
