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
    preview.src = this.src.video;
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
      document.removeEventListener('pointermove', this.trimMove);
    }, {once: true});
  }

  trimMove(e) {
    const diff = (e.clientX + timelineScroll - this.initX) / scale;
    if (this.trimmingStart) {
      this.start = this.initVal + diff;
      if (this.start < 0) this.start = 0;
      this.elem.style.backgroundPosition = -this.start * scale + 'px';
      this.elem.style.setProperty('--pos', (this.pos + this.start - this.initVal) * scale + 'px');
      this.elem.style.setProperty('--length', this.length * scale + 'px');
      preview.currentTime = this.pos + this.start - this.initVal;
    } else {
      this.end = this.initVal + diff;
      if (this.end > this.src.length) this.end = this.src.length;
      this.elem.style.setProperty('--length', this.length * scale + 'px');
      preview.currentTime = this.pos + this.length;
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
const nextBtn = document.getElementById('play');
const currentTime = document.getElementById('current');
const lengthSpan = document.getElementById('length');
const zoomOutBtn = document.getElementById('out');
const zoomDisplay = document.getElementById('zoom')
const zoomInBtn = document.getElementById('in');
const timelineWrapper = document.getElementById('timeline');
const previewMarker = document.getElementById('marker');

const clips = [];
let scale = 3;
function updateClips() {
  for (let i = 0, x = 0; i < clips.length; x += clips[i++].length) {
    clips[i].clipIndex = i;
    clips[i].pos = x;
    clips[i].elem.style.setProperty('--pos', x * scale + 'px');
  }
}

let timelineScroll = timelineWrapper.scrollLeft;
timelineWrapper.addEventListener('scroll', e => {
  timelineScroll = timelineWrapper.scrollLeft;
});

addSource.addEventListener('change', e => {
  if (addSource.files[0]) {
    const source = new Source(addSource.files[0].name);
    source.attachFile(addSource.files[0]);
    addSource.disabled = true;
    addSource.parentNode.classList.add('disabled');
    source.ready.then(() => {
      addSource.disabled = false;
      addSource.parentNode.classList.remove('disabled');
    });
  }
});
