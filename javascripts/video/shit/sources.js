const thumbnailCanvas = Elem('canvas');
const thumbnailContext = thumbnailCanvas.getContext('2d');
const thumbnailVideo = Elem('video');
const thumbnailAudio = Elem('audio');
const audioContext = new AudioContext();

const sources = {
  text: {
    id: 'text',
    tracks: [],
    createTrack() {
      return new TextTrack();
    }
  },
  rect: {
    id: 'rect',
    tracks: [],
    createTrack() {
      return new RectTrack();
    }
  }
};

const sourceMenu = new Menu([
  {label: 'download', fn: source => {
    const url = URL.createObjectURL(source.file);
    const saveLink = document.createElement('a');
    saveLink.href = url;
    saveLink.download = source.name;
    document.body.appendChild(saveLink);
    saveLink.click();
    document.body.removeChild(saveLink);
    URL.revokeObjectURL(url);
  }},
  {label: 'remove', danger: true, fn: source => {
    source.remove();
  }}
]);

class Source {

  constructor(file, id) {
    this.file = file;
    this.url = URL.createObjectURL(file);
    if (id) {
      this.id = id;
      this.name = id.slice(id.indexOf('-') + 1);
    } else {
      this.name = file.name;
      this.id = Math.random().toString(36).slice(2) + '-' + file.name;
      sources[this.id] = this;
    }
    this.tracks = [];
    this.elem = Elem('div', {
      className: 'source disabled',
      tabIndex: 0,
      oncontextmenu: e => {
        sourceMenu.items[1].disabled = this.tracks.length;
        sourceMenu.open(e.clientX, e.clientY, this);
      }
    }, [
      Elem('span', {className: 'name'}, [this.name])
    ]);
    isDragTrigger(this.elem, (e, switchControls) => {
      const track = this.createTrack();
      track.dragStart(e, [5, 5], true);
      switchControls([track.dragMove, track.dragEnd]);
    });

    this.ready = new Promise(res => this.amReady = res)
      .then(() => {
        this.elem.classList.remove('disabled');
        this.elem.style.backgroundImage = `url(${encodeURI(this.thumbnail)})`;
      });
  }

  remove() {
    delete sources[this.id];
    if (this.elem.parentNode) this.elem.parentNode.removeChild(this.elem);
    // this class tends to have big data in it, so this tries to get rid of them just in case
    for (const prop in this) this[prop] = null;
  }

  toJSON() {
    return {id: this.id, type: this.file.type};
  }

}

class VideoSource extends Source {

  constructor(...args) {
    super(...args);
    this.elem.classList.add('video');
    this.onVideoLoad = this.onVideoLoad.bind(this);
    thumbnailVideo.addEventListener('loadedmetadata', this.onVideoLoad);
    thumbnailVideo.src = this.url;
  }

  onVideoLoad() {
    if (thumbnailVideo.readyState < 2) return;
    thumbnailVideo.removeEventListener('loadedmetadata', this.onVideoLoad);
    if (thumbnailVideo.duration === Infinity) {
      // https://victorblog.com/2018/02/14/get-video-and-audio-blob-duration-in-html5/
      // https://stackoverflow.com/a/39971175
      thumbnailVideo.currentTime = 1e101;
      thumbnailVideo.addEventListener('timeupdate', this.onVideoLoad, {once: true});
      return;
    }
    this.length = thumbnailVideo.duration;
    thumbnailVideo.addEventListener('timeupdate', e => {
      this.width = thumbnailCanvas.width = thumbnailVideo.videoWidth;
      this.height = thumbnailCanvas.height = thumbnailVideo.videoHeight;
      thumbnailContext.drawImage(thumbnailVideo, 0, 0, thumbnailVideo.videoWidth, thumbnailVideo.videoHeight);
      this.thumbnail = thumbnailCanvas.toDataURL();
      this.amReady();
    }, {once: true});
    thumbnailVideo.currentTime = thumbnailVideo.duration / 2;
  }

  createTrack() {
    return new VideoTrack(this);
  }

}

class ImageSource extends Source {

  constructor(...args) {
    super(...args);
    this.elem.classList.add('image');
    this.thumbnail = this.url;
    this.image = new Image();
    this.image.onload = e => {
      this.width = this.image.width;
      this.height = this.image.height;
      this.amReady();
    };
    this.image.src = this.url;
  }

  createTrack() {
    return new ImageTrack(this);
  }

}

const HEIGHT = 100;
const CHUNK_SIZE = 1024;
class AudioSource extends Source {

  constructor(...args) {
    super(...args);
    this.elem.classList.add('audio');
    fetch(this.url)
      .then(r => r.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.length = audioBuffer.duration;
        const samples = audioBuffer.getChannelData(0);
        let chunk = samples.length / CHUNK_SIZE > 1000 ? Math.floor(samples.length / 1000) : CHUNK_SIZE;
        thumbnailCanvas.width = Math.ceil(samples.length / chunk);
        thumbnailCanvas.height = HEIGHT;
        thumbnailContext.fillStyle = 'rgba(255, 255, 255, 0.5)';
        // calculates an RMS, according to Wikipedia
        // why RMS? idk, that's what Scratch did though
        // I don't even know what an RMS is
        for (let i = 0; i * chunk < samples.length; i++) {
          let sum = 0, n;
          for (n = 0; n < chunk && i * chunk + n < samples.length; n++) {
            sum += samples[i * chunk + n] * samples[i * chunk + n];
          }
          const rms = Math.sqrt(sum / n);
          thumbnailContext.fillRect(i, (1 - rms) * HEIGHT, 1, rms * HEIGHT);
        }
        this.thumbnail = thumbnailCanvas.toDataURL();
        this.amReady();
      });
  }

  createTrack() {
    return new AudioTrack(this);
  }

}

function toSource(mime) {
  const [type] = mime.split('/');
  switch (type) {
    case 'video':
      return VideoSource;
    case 'image':
      return ImageSource;
    case 'audio':
      return AudioSource;
  }
}

const fontLink = Elem('link', {
  rel: 'stylesheet'
});
document.head.appendChild(fontLink);
const fonts = {};
let prevHref;
function updateFonts() {
  let href = '';
  Object.keys(fonts).forEach(font => {
    let weightStr = '';
    Object.keys(fonts[font]).forEach(weight => {
      if (fonts[font][weight]) weightStr += ',' + weight;
      else delete fonts[font][weight];
    });
    if (weightStr) href += `|${font.replace(/ /g, '+')}:${weightStr.slice(1)}`;
    else delete fonts[font];
  });
  if (href && prevHref !== href) {
    fontLink.href = 'https://fonts.googleapis.com/css?family=' + href.slice(1);
  }
}
