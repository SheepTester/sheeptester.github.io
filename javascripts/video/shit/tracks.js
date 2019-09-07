const SNAP_DIST = 10; // in px
const MIN_LENGTH = 0.1; // in s

const baseProps = [
  {
    id: 'start',
    label: 'Trim start',
    unit: 's',
    digits: 1,
    range: 30,
    defaultVal: 0
  }
];

const mediaProps = [
  {
    id: 'trimStart',
    label: 'Trim start',
    unit: 's',
    digits: 1,
    range: 30,
    defaultVal: 0
  },
  {
    id: 'trimEnd',
    label: 'Trim end',
    unit: 's',
    digits: 1,
    range: 30,
    defaultVal: 0
  },
  {
    id: 'volume',
    label: 'Volume',
    units: '%',
    digits: 0,
    range: 100,
    defaultVal: 100,
    animatable: true
  }
];
const graphicalProps = [
  {
    id: 'opacity',
    label: 'Opacity',
    units: '%',
    digits: 0,
    range: 100,
    defaultVal: 100,
    animatable: true
  },
  {
    id: 'xPos',
    label: 'Position X',
    digits: 3,
    range: 1,
    defaultVal: 0,
    animatable: true
  },
  {
    id: 'yPos',
    label: 'Position Y',
    digits: 3,
    range: 1,
    defaultVal: 0,
    animatable: true
  },
  {
    id: 'xScale',
    label: 'Scale X',
    digits: 3,
    range: 1,
    defaultVal: 0,
    animatable: true
  },
  {
    id: 'yScale',
    label: 'Scale Y',
    digits: 3,
    range: 1,
    defaultVal: 0,
    animatable: true
  },
  {
    id: 'rotation',
    label: 'Rotation',
    unit: '°',
    digits: 1,
    range: 180,
    defaultVal: 0,
    animatable: true
  }
];

const lengthProp = {
  id: 'length',
  label: 'Duration',
  unit: 's',
  digits: 1,
  range: 30,
  defaultVal: 3
};

class Track {

  constructor(source, props) {
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);

    this.source = source;
    this.keys = [];
    this.props = props;
    props.forEach(({id, defaultVal}) => {
      if (defaultVal !== undefined) this[id] = defaultVal;
    });
    this.elem = Elem('div', {
      className: 'track',
      style: {
        backgroundImage: source.thumbnail && `url(${encodeURI(source.thumbnail)})`
      }
    }, [
      Elem('span', {className: 'trim trim-start'}),
      this.name = Elem('span', {className: 'name'}, [source.name]),
      Elem('span', {className: 'trim trim-end'})
    ]);
    isDragTrigger(this.elem, e => this.dragStart(e), this.dragMove, this.dragEnd);
    this.placeholder = Elem('div', {className: 'track placeholder'});
    this.updateScale();
  }

  get end() {
    return this.start + this.length;
  }

  set end(end) {
    this.length = end - this.start;
  }

  // sets this.start while keeping this.end constant
  setLeftSide(start) {
    this.length = this.end - start;
    this.start = start;
  }

  updateLength() {
    this.elem.style.setProperty('--start', this.start * scale + 'px');
    this.elem.style.setProperty('--length', this.length * scale + 'px');
  }

  updateScale() {
    this.updateLength();
  }

  // TODO: don't start dragging immediately unless otherwise specified
  dragStart({clientX, clientY, target}, offsets) {
    this.timelineLeft = layersWrapper.getBoundingClientRect().left + scrollX;
    this.currentState = getEntry();
    if (target.classList.contains('trim')) {
      this.trimming = true;
      document.body.classList.add('trimming');
      this.trimmingStart = target.classList.contains('trim-start');
      if (this.trimmingStart) {
        this.init = this.start;
        this.trimMin = this.index > 0
          ? this.layer.tracks[this.index - 1].end
          : 0;
        this.trimMax = this.end - MIN_LENGTH;
      } else {
        this.init = this.end;
        this.trimMin = this.start + MIN_LENGTH;
        this.trimMax = this.index < this.layer.tracks.length - 1
          ? this.layer.tracks[this.index + 1].start
          : Infinity;
      }
      this.jumpPoints = getAllJumpPoints();
      // do not snap to other side
      const index = this.jumpPoints.indexOf(this.trimmingStart ? this.end : this.start);
      if (~index) this.jumpPoints.splice(index, 1);
      return;
    }
    if (this.layer) {
      this.layer.tracks.splice(this.index, 1);
      this.layer.updateTracks();
    }
    this.layerBounds = getLayerBounds();
    this.jumpPoints = getAllJumpPoints();
    if (!offsets) {
      const {left, top} = this.elem.getBoundingClientRect();
      offsets = [clientX - left, clientY - top];
    }
    this.dragOffsets = offsets;
    this.elem.classList.add('dragging');
    this.elem.style.left = clientX - offsets[0] + 'px';
    this.elem.style.top = clientY - offsets[1] + 'px';
    document.body.appendChild(this.elem);
    this.possibleLayer = null;
    this.placeholder.style.setProperty('--length', this.length * scale + 'px');
  }

  dragMove({clientX, clientY, shiftKey}) {
    if (this.trimming) {
      let cursor = (clientX + scrollX - this.timelineLeft) / scale;
      // TODO: snapping for loop borders
      if (!shiftKey) cursor = Track.snapPoint(this.jumpPoints, cursor);
      if (cursor < this.trimMin) cursor = this.trimMin;
      else if (cursor > this.trimMax) cursor = this.trimMax;
      if (this.trimmingStart) {
        this.setLeftSide(cursor);
      } else {
        this.end = cursor;
      }
      this.updateLength();
      return;
    }
    const placeholder = this.placeholder;
    if (clientY < this.layerBounds[0].top) {
      if (this.possibleLayer) {
        placeholder.parentNode.removeChild(placeholder);
        this.possibleLayer = null;
      }
    } else {
      const {layer} = this.layerBounds.find(({bottom}) => clientY < bottom - scrollY)
        || this.layerBounds[this.layerBounds.length - 1];
      if (this.possibleLayer !== layer) {
        this.possibleLayer = layer;
        layer.elem.appendChild(placeholder);
      }
      this.possibleStart = (clientX - this.dragOffsets[0] + scrollX - this.timelineLeft) / scale;
      if (!shiftKey) {
        this.possibleStart = Track.snapPoint(
          this.jumpPoints,
          this.possibleStart,
          this.possibleStart + this.length
        );
      }
      if (this.possibleStart < 0) this.possibleStart = 0;
      placeholder.style.setProperty('--start', this.possibleStart * scale + 'px');
    }
    this.elem.style.left = clientX - this.dragOffsets[0] + 'px';
    this.elem.style.top = clientY - this.dragOffsets[1] + 'px';
  }

  dragEnd() {
    this.timelineLeft = null;
    this.jumpPoints = null;
    if (this.trimming) {
      log(this.currentState);
      this.trimming = false;
      document.body.classList.remove('trimming');
      return;
    }
    this.layerBounds = null;
    this.dragOffsets = null;
    this.elem.classList.remove('dragging');
    this.elem.style.left = null;
    this.elem.style.top = null;
    const layer = this.possibleLayer;
    if (layer) {
      log(this.currentState);
      this.placeholder.parentNode.removeChild(this.placeholder);
      this.start = this.possibleStart;
      this.updateLength();
      if (layer.tracksBetween(this.start, this.end).length) {
        if (layer.index > 0 && !layers[layer.index - 1].tracksBetween(this.start, this.end).length) {
          layers[layer.index - 1].addTrack(this);
        } else {
          const newLayer = new Layer();
          layer.insertBefore(newLayer);
          newLayer.addTrack(this);
        }
      } else {
        layer.addTrack(this);
      }
    } else {
      this.remove('drag-delete');
    }
    this.possibleLayer = null;
    this.possibleStart = null;
    this.currentState = null;
  }

  remove(reason) {
    if (this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem);
    }
    if (this.layer) {
      log(this.currentState || getEntry());
      this.layer.tracks.splice(this.index, 1);
      this.layer.updateTracks();
    }
  }

  setProps(values) {
    this.props.forEach(({id}) => {
      if (values[id] !== undefined) {
        this[id] = values[id];
      }
    });
  }

  toJSON() {
    const obj = {source: this.source.id};
    this.props.forEach(({id}) => obj[id] = this[id]);
    return obj;
  }

  // returns jumpPoint relative to currentTime, even if it snaps
  // according to altTime
  static snapPoint(jumpPoints, currentTime, altTime) {
    let jumpPoint = currentTime, minDist = Infinity;
    jumpPoints.forEach(time => {
      const dist = Math.abs(time - currentTime);
      const altDist = Math.abs(time - altTime);
      if (dist < SNAP_DIST / scale && dist < minDist) {
        jumpPoint = time;
        minDist = dist;
      } else if (altDist < SNAP_DIST / scale && altDist < minDist) {
        jumpPoint = time - (altTime - currentTime);
        minDist = altDist;
      }
    });
    return jumpPoint;
  }

}

class MediaTrack extends Track {

  constructor(source, extraProps = []) {
    super(
      source,
      [...baseProps, ...mediaProps, ...extraProps]
    );
    this.trimEnd = this.source.length;
    this.updateLength();
  }

  get length() {
    return this.trimEnd - this.trimStart;
  }

  set length(len) {
    this.trimEnd = this.trimStart + len;
  }

  setLeftSide(start) {
    this.trimStart = this.trimStart + start - this.start;
    this.start = start;
  }

  updateLength() {
    super.updateLength();
    this.elem.style.backgroundPosition = -this.trimStart * scale + 'px';
  }

  updateScale() {
    super.updateScale();
    this.elem.style.backgroundSize = this.source.length * scale + 'px';
  }

}

class VideoTrack extends MediaTrack {

  constructor(source) {
    super(source, graphicalProps);
    this.elem.classList.add('video');
    let videoLoaded;
    this.videoLoaded = new Promise(res => videoLoaded = res);
    this.video = Elem('video', {
      src: this.source.url,
      onloadeddata: e => {
        if (this.video.readyState < 2) return;
        videoLoaded();
      }
    });
  }

  prepare(relTime) {
    return new Promise(res => {
      this.video.addEventListener('timeupdate', res, {once: true});
      this.video.currentTime = relTime + this.trimStart; // TODO: this is incorrect
    });
  }

  render(ctx, play = false) {
    ctx.drawImage(this.video, 0, 0, this.source.width, this.source.height);
    if (play) this.video.play();
  }

}

class AudioTrack extends MediaTrack {

  constructor(source) {
    super(source);
    this.elem.classList.add('audio');
    this.audio = new Audio(this.source.url);
    this.audioLoaded = new Promise(res => this.audio.onload = res);
  }

  render(ctx, play = false) {
    if (play) this.audio.play();
  }

}

class ImageTrack extends Track {

  constructor(source) {
    super(
      source,
      [...baseProps, lengthProp, ...graphicalProps]
    );
    this.elem.classList.add('image');
  }

  render(ctx) {
    ctx.drawImage(this.source.image, 0, 0, this.source.width, this.source.height);
  }

}

class TextTrack extends Track {

  constructor() {
    super(
      sources.text,
      // TODO: font? and also text value lol
      [...baseProps, lengthProp, ...graphicalProps, {
        id: 'rColour',
        label: 'Red',
        digits: 0,
        range: 255,
        defaultVal: 255,
        animatable: true
      }, {
        id: 'gColour',
        label: 'Green',
        digits: 0,
        range: 255,
        defaultVal: 255,
        animatable: true
      }, {
        id: 'bColour',
        label: 'Blue',
        digits: 0,
        range: 255,
        defaultVal: 255,
        animatable: true
      }]
    );
    this.elem.classList.add('text');
  }

  render(ctx) {
    ctx.fillStyle = 'white';
    ctx.font = '50px serif';
    ctx.fillText('yeet', 100, 100);
  }

}
