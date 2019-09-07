const SNAP_DIST = 10; // px
const MIN_LENGTH = 0.1; // s
const DRAG_MIN_DIST = 5; // px

class Track {

  constructor(source, props) {
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.change = this.change.bind(this);

    this.source = source;
    this.keys = [];
    this.props = props;
    props.props.forEach(({id, defaultVal}) => {
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
  dragStart({clientX, clientY, target}, offsets, dragImmediately = false) {
    if (dragImmediately) {
      this.startDragging(clientX, clientY, target, offsets);
    } else {
      this.dragStartData = [clientX, clientY, target, offsets];
      this.dragging = false;
    }
  }

  startDragging(clientX, clientY, target, offsets) {
    this.dragging = true;
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
    } else {
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
  }

  dragMove({clientX, clientY, shiftKey}) {
    if (!this.dragging) {
      if (Math.hypot(clientX - this.dragStartData[0], clientY - this.dragStartData[1]) > DRAG_MIN_DIST) {
        this.startDragging(...this.dragStartData);
      } else {
        return;
      }
    }
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
      if (Track.selected === this) {
        this.props.setValues(this);
      }
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
    this.init = null;
    if (!this.dragging) {
      if (Track.selected === this) {
        this.unselected();
      } else {
        if (Track.selected) Track.selected.unselected();
        this.selected();
      }
      return;
    }
    this.timelineLeft = null;
    this.jumpPoints = null;
    if (this.trimming) {
      log(this.currentState);
      this.trimming = false;
      document.body.classList.remove('trimming');
      rerender();
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
    rerender();
    if (Track.selected === this) {
      this.props.setValues(this);
    }
  }

  selected() {
    Track.selected = this;
    document.body.classList.add('has-selection');
    this.layer.elem.classList.add('has-selected');
    this.elem.classList.add('selected');
    this.props.setValues(this);
    this.props.handler = this.change;
    propertiesList.appendChild(this.props.elem);
  }

  unselected() {
    Track.selected = null;
    document.body.classList.remove('has-selection');
    this.layer.elem.classList.remove('has-selected');
    this.elem.classList.remove('selected');
    propertiesList.removeChild(this.props.elem);
  }

  remove(reason) {
    if (reason !== 'layer-removal') {
      if (this.elem.parentNode) {
        this.elem.parentNode.removeChild(this.elem);
      }
      if (this.layer) {
        log(this.currentState || getEntry());
        this.layer.tracks.splice(this.index, 1);
        this.layer.updateTracks();
      }
    }
    if (Track.selected === this) {
      this.unselected();
    }
  }

  change(prop, value, isFinal) {
    if (isFinal) {
      log(this.propChangesLog);
      this.propChangesLog = null;
    } else if (!this.propChangesLog) {
      this.propChangesLog = getEntry();
    }
    const returnVal = this.showChange(prop, value, isFinal);
    if (returnVal !== undefined) value = returnVal;
    this[prop] = value;
    rerender();
    return returnVal;
  }

  showChange(prop, value, isFinal) {
    let returnVal;
    switch (prop) {
      case 'start':
        if (value < 0) value = returnVal = 0;
        if (isFinal) {
          this.layer.tracks.splice(this.index, 1);
          const intersections = this.layer.tracksBetween(value, value + this.length);
          if (intersections[0]) {
            this.setLeftSide(intersections[0].end);
            if (intersections[1]) {
              this.end = intersections[1].start;
            }
          } else {
            this.start = value;
          }
          this.layer.addTrack(this);
        } else {
          this.start = value;
        }
        returnVal = this.start;
        this.updateLength();
        break;
      case 'length':
        if (value < MIN_LENGTH) value = returnVal = MIN_LENGTH;
        if (isFinal) {
          if (this.index < this.layer.tracks.length - 1) {
            if (this.layer.tracks[this.index + 1].start < this.start + value) {
              value = returnVal = this.layer.tracks[this.index + 1].start - this.start;
            }
          }
        }
        this.length = value;
        this.updateLength();
        break;
    }
    return returnVal;
  }

  setProps(values) {
    this.props.props.forEach(({id}) => {
      if (values[id] !== undefined) {
        this[id] = values[id];
      }
    });
  }

  toJSON() {
    const obj = {source: this.source.id, selected: Track.selected === this};
    this.props.props.forEach(({id}) => obj[id] = this[id]);
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

  constructor(source, props) {
    super(
      source,
      props
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

  showChange(prop, value, isFinal) {
    let returnVal;
    switch (prop) {
      case 'volume':
        if (value > 100) return 100;
        else if (value < 0) return 0;
      case 'trimStart':
        if (value > this.trimEnd - MIN_LENGTH) return this.trimEnd - MIN_LENGTH;
      case 'trimEnd':
        if (value < this.trimStart + MIN_LENGTH) return this.trimStart + MIN_LENGTH;
      default:
        return super.showChange(prop, value, isFinal);
    }
    return returnVal;
  }

}

class VideoTrack extends MediaTrack {

  static get props() {
    return this._props || (this._props = new Properties([
      ...baseProps,
      ...mediaProps,
      ...graphicalProps
    ]));
  }

  constructor(source) {
    super(source, VideoTrack.props);
    this.elem.classList.add('video');
    let videoLoaded;
    this.videoLoaded = new Promise(res => videoLoaded = res);
    this.video = Elem('video', {
      src: this.source.url,
      loop: true,
      onloadeddata: e => {
        if (this.video.readyState < 2) return;
        videoLoaded();
      }
    });
  }

  prepare(relTime) {
    return new Promise(res => {
      this.video.addEventListener('timeupdate', res, {once: true});
      this.video.currentTime = mod(relTime + this.trimStart, this.source.length); // TODO: this is incorrect
    });
  }

  render(ctx, time, play = false) {
    ctx.save();
    ctx.translate(ctx.canvas.width * (this.xPos + 1) / 2, ctx.canvas.height * (this.yPos + 1) / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.scale(this.xScale, this.yScale);
    ctx.globalAlpha = this.opacity / 100;
    let width, height;
    if (this.source.width / this.source.height > ctx.canvas.width / ctx.canvas.height) {
      width = ctx.canvas.height / this.source.height * this.source.width, height = ctx.canvas.height;
    } else {
      width = ctx.canvas.width, height = ctx.canvas.width / this.source.width * this.source.height;
    }
    ctx.drawImage(this.video, -width / 2, -height / 2, width, height);
    ctx.restore();
    if (play) this.video.play();
  }

}

class AudioTrack extends MediaTrack {

  static get props() {
    return this._props || (this._props = new Properties([
      ...baseProps,
      ...mediaProps
    ]));
  }

  constructor(source) {
    super(source, AudioTrack.props);
    this.elem.classList.add('audio');
    this.audio = new Audio(this.source.url);
    this.audioLoaded = new Promise(res => this.audio.onload = res);
    this.audio.loop = true;
  }

  render(ctx, time, play = false) {
    if (play) this.audio.play();
  }

}

class ImageTrack extends Track {

  static get props() {
    return this._props || (this._props = new Properties([
      ...baseProps,
      lengthProp,
      ...graphicalProps
    ]));
  }

  constructor(source) {
    super(
      source,
      ImageTrack.props
    );
    this.elem.classList.add('image');
  }

  render(ctx, time) {
    ctx.save();
    ctx.translate(ctx.canvas.width * (this.xPos + 1) / 2, ctx.canvas.height * (this.yPos + 1) / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.scale(this.xScale, this.yScale);
    ctx.globalAlpha = this.opacity / 100;
    let width, height;
    if (this.source.width / this.source.height > ctx.canvas.width / ctx.canvas.height) {
      width = ctx.canvas.height / this.source.height * this.source.width, height = ctx.canvas.height;
    } else {
      width = ctx.canvas.width, height = ctx.canvas.width / this.source.width * this.source.height;
    }
    ctx.drawImage(this.source.image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

}

class TextTrack extends Track {

  static get props() {
    return this._props || (this._props = new Properties([
      {
        id: 'font',
        label: 'Font',
        defaultVal: 'Open Sans'
      },
      {
        id: 'content',
        label: 'Text',
        defaultVal: 'Xi Jinping eats, shoots, and [removed]!'
      },
      ...baseProps,
      lengthProp,
      ...graphicalProps,
      {
        id: 'hColour',
        label: 'Hue',
        digits: 0,
        range: 360,
        defaultVal: 0,
        animatable: true
      },
      {
        id: 'sColour',
        label: 'Saturation',
        digits: 0,
        range: 100,
        defaultVal: 0,
        animatable: true
      },
      {
        id: 'lColour',
        label: 'Lightness',
        digits: 0,
        range: 100,
        defaultVal: 100,
        animatable: true
      }
    ]));
  }

  constructor() {
    super(sources.text, TextTrack.props);
    this.elem.classList.add('text');
    this.name.textContent = this.content;
  }

  showChange(prop, value, isFinal) {
    let returnVal;
    switch (prop) {
      case 'content':
        this.name.textContent = value;
        break;
      case 'sColour':
      case 'lColour':
      case 'opacity':
        if (value > 100) return 100;
        else if (value < 0) return 0;
      default:
        return super.showChange(prop, value, isFinal);
    }
    return returnVal;
  }

  render(ctx, time) {
    ctx.save();
    ctx.translate(ctx.canvas.width * (this.xPos + 1) / 2, ctx.canvas.height * (this.yPos + 1) / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.scale(this.xScale, this.yScale);
    ctx.fillStyle = `hsla(${mod(this.hColour, 360)}, ${this.sColour}%, ${this.lColour}%, ${this.opacity / 100})`;
    ctx.font = `50px "${this.font.replace(/"/g, '\\"')}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.content, 0, 0);
    ctx.restore();
  }

}
