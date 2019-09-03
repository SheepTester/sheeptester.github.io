const thumbnailCanvas = Elem('canvas');
const thumbnailContext = thumbnailCanvas.getContext('2d');
const thumbnailVideo = Elem('video');
const thumbnailAudio = Elem('audio');
const audioContext = new AudioContext();

class Source {

  constructor(file) {
    this.file = file;
    this.url = URL.createObjectURL(file);
    this.name = file.name;
    this.elem = Elem('div', {
      className: 'source disabled',
      tabIndex: 0
    }, [
      Elem('span', {className: 'name'}, [this.name])
    ]);

    this.ready = new Promise(res => this.amReady = res)
      .then(() => {
        this.elem.classList.remove('disabled');
        this.elem.style.backgroundImage = `url(${encodeURI(this.thumbnail)})`;
      });
  }

}

class VideoSource extends Source {

  constructor(file) {
    super(file);
    this.elem.classList.add('video');
    this.onVideoLoad = this.onVideoLoad.bind(this);
    thumbnailVideo.addEventListener('loadeddata', this.onVideoLoad);
    thumbnailVideo.src = this.url;
  }

  onVideoLoad() {
    if (thumbnailVideo.readyState < 2) return;
    thumbnailVideo.removeEventListener('loadeddata', this.onVideoLoad);
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

}

class ImageSource extends Source {

  constructor(file) {
    super(file);
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

}

const HEIGHT = 100;
const CHUNK_SIZE = 1024;
class AudioSource extends Source {

  constructor(file) {
    super(file);
    this.elem.classList.add('audio');
    fetch(this.url)
      .then(r => r.arrayBuffer())
      .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
      .then(audioBuffer => {
        this.length = audioBuffer.duration;
        const samples = audioBuffer.getChannelData(0);
        thumbnailCanvas.width = Math.ceil(samples.length / CHUNK_SIZE);
        thumbnailCanvas.height = HEIGHT;
        thumbnailContext.fillStyle = 'rgba(255, 255, 255, 0.5)';
        // calculates an RMS, according to Wikipedia
        // why RMS? idk, that's what Scratch did though
        // I don't even know what an RMS is
        for (let i = 0; i * CHUNK_SIZE < samples.length; i++) {
          let sum = 0, n;
          for (n = 0; n < CHUNK_SIZE && i * CHUNK_SIZE + n < samples.length; n++) {
            sum += samples[i * CHUNK_SIZE + n] * samples[i * CHUNK_SIZE + n];
          }
          const rms = Math.sqrt(sum / n);
          thumbnailContext.fillRect(i, (1 - rms) * HEIGHT, 1, rms * HEIGHT);
        }
        this.thumbnail = thumbnailCanvas.toDataURL();
        this.amReady();
      });
  }

}

function toSource(file) {
  const [type] = file.type.split('/');
  switch (type) {
    case 'video':
      return new VideoSource(file);
    case 'image':
      return new ImageSource(file);
    case 'audio':
      return new AudioSource(file);
  }
}
