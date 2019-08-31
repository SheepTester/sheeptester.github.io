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
      Elem('span', {className: 'source-name'}, [name])
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
    clip.startDragging(e.clientX - rect.left, e.clientY - rect.top, rect.left, rect.top);
  }

}

class Clip {

  constructor(src) {
    this.dragMove = this.dragMove.bind(this);

    this.src = src;
    this.start = 0;
    this.end = src.length;
    this.elem = Elem('div', {
      className: 'clip',
      style: {
        '--start': this.start,
        '--length': this.end - this.start,
        backgroundImage: `url(${encodeURI(src.image)})`
      }
    }, [
      Elem('span', {className: 'source-name'}, [src.name])
    ]);
  }

  startDragging(diffX, diffY, startX, startY) {
    document.body.style.touchAction = 'none';
    this.dragData = [diffX, diffY];
    this.elem.style.left = startX + 'px';
    this.elem.style.top = startY + 'px';
    this.elem.classList.add('dragging');
    document.body.appendChild(this.elem);
    document.body.addEventListener('pointermove', this.dragMove);
    document.body.addEventListener('pointerup', e => {
      this.dragData = null;
      document.body.style.touchAction = null;
      document.body.removeEventListener('pointermove', this.dragMove);
    }, {once: true});
  }

  dragMove(e) {
    this.elem.style.left = e.clientX - this.dragData[0] + 'px';
    this.elem.style.top = e.clientY - this.dragData[1] + 'px';
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
