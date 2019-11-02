const SNAP_DIST = 10; // px
const MIN_LENGTH = 0.1; // s
const DRAG_MIN_DIST = 5; // px
const SELECT_PADDING = 12; // px

const trackMenu = new Menu([
  {label: 'Split', fn: track => {
    track.splitAt(previewTime - track.start);
  }},
  {label: 'Duplicate', fn: track => {
    log(actions.DUPLICATE);
    const newTrack = track.source.createTrack();
    newTrack.setProps(track.toJSON());
    newTrack.start = track.end;
    newTrack.updateLength();
    const neighbourTrack = track.layer.tracks[track.index + 1];
    if (neighbourTrack && neighbourTrack.start < track.end + track.length) {
      track.layer.insertBefore();
      layers[track.layer.index - 1].addTrack(newTrack);
    } else {
      track.layer.addTrack(newTrack);
    }
  }},
  {label: 'Delete', danger: true, fn: track => {
    log(actions.DELETE);
    track.remove('delete');
  }}
]);

class Track {

  constructor(source, props) {
    this.dragMove = this.dragMove.bind(this);
    this.dragEnd = this.dragEnd.bind(this);
    this.change = this.change.bind(this);
    this.keyChange = this.keyChange.bind(this);

    this.source = source;
    source.tracks.push(this);
    this.keys = {};
    this.props = props;
    props.props.forEach(({id, defaultVal}) => {
      if (defaultVal !== undefined) this[id] = defaultVal;
    });
    this.elem = Elem('div', {
      className: 'track',
      style: {
        backgroundImage: source.thumbnail && `url(${encodeURI(source.thumbnail)})`
      },
      oncontextmenu: e => {
        trackMenu.open(e.clientX, e.clientY, this);
        if (!e.shiftKey) setPreviewTime(Math.max((e.clientX + scrollX - LEFT) / scale, 0), false);
      }
    }, [
      Elem('span', {className: 'trim trim-start'}),
      this.name = Elem('span', {className: 'name'}, [source.name]),
      Elem('span', {className: 'trim trim-end'}),
      this.keyWrapper = Elem('div', {className: 'keys'})
    ]);
    isDragTrigger(this.elem, (e, switchControls) => {
      if (Track.selected === this) {
        if (e.target.classList.contains('key-ease')) {
          switchControls([]);
        } else if (e.shiftKey) {
          this.dragStart(e, true);
        } else if (e.target.classList.contains('key-dot')) {
          this.dragStart(e, false);
        } else {
          switchControls(null);
        }
      } else if (e.ctrlKey || e.shiftKey) {
        switchControls(null);
      } else {
        this.dragStart(e);
      }
    }, this.dragMove, this.dragEnd);
    this.placeholder = Elem('div', {className: 'track placeholder'});
    this.selectBox = Elem('div', {className: 'selection'});
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
    this.shiftAllKeys(this.start - start);
    this.length = this.end - start;
    this.start = start;
  }

  shiftAllKeys(time) {
    Object.values(this.keys).forEach(keys => keys.forEach(key => {
      key.time += time;
      key.elem.style.left = key.time * scale + 'px';
    }));
  }

  updateLength() {
    this.elem.style.setProperty('--start', this.start * scale + 'px');
    this.elem.style.setProperty('--length', this.length * scale + 'px');
  }

  updateScale() {
    this.updateLength();
    Object.values(this.keys).forEach(keys => keys.forEach(key => {
      key.elem.style.left = key.time * scale + 'px';
    }));
  }

  dragStart({clientX, clientY, target}, offsets, isNew = false) {
    if (Track.selected === this) {
      this.selectInit = {
        isSelecting: offsets,
        target
      };
    }
    this.dragStartData = [clientX, clientY, target, offsets, isNew];
    this.dragging = false;
  }

  startDragging(clientX, clientY, target, offsets) {
    this.dragging = true;
    if (Track.selected === this) {
      // `offsets` means if shift key is down in this context oof
      this.selectInit = {
        x: clientX + scrollX - LEFT - this.start * scale,
        y: clientY + scrollY - this.elem.getBoundingClientRect().top,
        time: (clientX + scrollX - LEFT) / scale - this.start,
        fromSelected: target.classList.contains('select'),
        isSelecting: offsets
      };
      if (offsets) {
        this.elem.appendChild(this.selectBox);
      } else {
        if (!this.selectInit.fromSelected) {
          target.classList.add('select');
          if (!this.selectedKeys) this.selectedKeys = [];
          const time = +target.dataset.time;
          this.selectedKeys.push(this.keys[target.dataset.id].find(key => key.time === time));
        }
        this.jumpPoints = getAllJumpPoints();
        this.keyDragData = {dTime: 0, snappables: []};
        this.selectedKeys.forEach(({time}) => {
          if (!this.keyDragData.snappables.includes(time)) {
            this.keyDragData.snappables.push(time);
          }
        });
      }
      return;
    }
    this.currentState = getEntry();
    if (target.classList.contains('trim')) {
      this.trimming = true;
      document.body.classList.add('trimming');
      this.trimmingStart = target.classList.contains('trim-start');
      if (this.trimmingStart) {
        this.trimMin = this.index > 0
          ? this.layer.tracks[this.index - 1].end
          : 0;
        this.trimMax = this.end - MIN_LENGTH;
      } else {
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
    if (Track.selected === this) {
      const x = clientX + scrollX - LEFT - this.start * scale;
      const y = clientY + scrollY - this.elem.getBoundingClientRect().top;
      if (this.selectInit.isSelecting) {
        const left = Math.min(x, this.selectInit.x);
        const top = Math.min(y, this.selectInit.y);
        this.selectBox.style.left = left + 'px';
        this.selectBox.style.top = top + 'px';
        this.selectBox.style.width = Math.max(x, this.selectInit.x) - left + 'px';
        this.selectBox.style.height = Math.max(y, this.selectInit.y) - top + 'px';
      } else {
        this.keyDragData.dTime = x / scale - this.selectInit.time;
        if (!shiftKey) {
          this.keyDragData.dTime = Track.snapPoint(
            this.jumpPoints,
            ...this.keyDragData.snappables
              .map(time => this.start + time + this.keyDragData.dTime)
          ) - this.keyDragData.snappables[0] - this.start;
        }
        this.selectedKeys.forEach(key => {
          key.elem.style.left = (key.time + this.keyDragData.dTime) * scale + 'px';
        });
      }
      return;
    }
    if (this.trimming) {
      let cursor = (clientX + scrollX - LEFT) / scale;
      if (!shiftKey) cursor = Track.snapPoint(this.jumpPoints, cursor);
      if (cursor < this.trimMin) cursor = this.trimMin;
      else if (cursor > this.trimMax) cursor = this.trimMax;
      if (this.trimmingStart) {
        this.setLeftSide(cursor);
      } else {
        this.end = cursor;
      }
      this.updateLength();
      this.displayProperties();
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
      this.possibleStart = (clientX - this.dragOffsets[0] + scrollX - LEFT) / scale;
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

  dragEnd({clientX, clientY, shiftKey}, continueDragging) {
    // if `this.dragStartData` exists, then see if `isNew` is true, and if so return `this.dragStartData`
    let isNew = this.dragStartData && this.dragStartData[4] && this.dragStartData;
    this.dragStartData = null;
    if (Track.selected === this) {
      const trackTop = this.elem.getBoundingClientRect().top;
      const x = clientX + scrollX - LEFT - this.start * scale;
      const y = clientY + scrollY - trackTop;
      if (this.dragging) {
        if (this.selectInit.isSelecting) {
          const minTime = (Math.min(x, this.selectInit.x) - SELECT_PADDING) / scale;
          const minRow = Math.min(y, this.selectInit.y);
          const maxTime = (Math.max(x, this.selectInit.x) + SELECT_PADDING) / scale;
          const maxRow = Math.max(y, this.selectInit.y);
          const recruits = [];
          Object.values(this.keys).forEach(keys => {
            const rect = keys.elem.getBoundingClientRect();
            const top = rect.top + scrollY - trackTop;
            const bottom = rect.bottom + scrollY - trackTop;
            if (top <= maxRow && bottom >= minRow) {
              recruits.push(...keys.filter(({time}) => time >= minTime && time <= maxTime));
            }
          });
          if (!this.selectedKeys) this.selectedKeys = [];
          if (this.selectInit.fromSelected) {
            recruits.forEach(key => {
              if (key.elem.classList.contains('select')) {
                key.elem.classList.remove('select');
                this.selectedKeys.splice(this.selectedKeys.indexOf(key), 1);
              }
            });
          } else {
            recruits.forEach(key => {
              if (!key.elem.classList.contains('select')) {
                key.elem.classList.add('select');
                this.selectedKeys.push(key);
              }
            });
          }
          if (!this.selectedKeys.length) this.selectedKeys = null;
          this.elem.removeChild(this.selectBox);
        } else {
          log(actions.MOVE_KEYS);
          this.selectedKeys.forEach(key => {
            key.time += this.keyDragData.dTime;
            key.elem.style.left = key.time * scale + 'px';
            key.elem.dataset.time = key.time;
          });
          Object.values(this.keys).forEach(keys => {
            keys.sort((a, b) => a.time - b.time);
          });
          this.removeOutOfBoundKeys();
          rerender();
          this.displayProperties();
          this.jumpPoints = null;
          this.keyDragData = null;
        }
      } else {
        const elem = this.selectInit.target;
        if (elem.classList.contains('key-dot')) {
          if (this.selectInit.isSelecting) {
            const keyTime = +elem.dataset.time;
            const key = this.keys[elem.dataset.id].find(({time}) => time === keyTime);
            if (key.elem.classList.contains('select')) {
              key.elem.classList.remove('select');
              this.selectedKeys.splice(this.selectedKeys.indexOf(key), 1);
              if (!this.selectedKeys.length) this.selectedKeys = null;
            } else {
              if (!this.selectedKeys) this.selectedKeys = [];
              key.elem.classList.add('select');
              this.selectedKeys.push(key);
            }
          } else {
            setPreviewTime(this.start + +elem.dataset.time, false);
          }
        } else {
          this.selectedKeys.forEach(key => {
            key.elem.classList.remove('select');
          });
          this.selectedKeys = null;
        }
      }
      this.selectInit = null;
      return;
    }
    if (!this.dragging) {
      if (isNew) {
        continueDragging();
        this.startDragging(...isNew);
      } else {
        if (Track.selected) Track.selected.unselected();
        this.selected();
        if (!shiftKey) setPreviewTime(Math.max((clientX + scrollX - LEFT) / scale, 0), false);
      }
      return;
    }
    this.jumpPoints = null;
    if (this.trimming) {
      log(actions.TRIM, this.currentState);
      this.trimming = false;
      document.body.classList.remove('trimming');
      this.removeOutOfBoundKeys();
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
      log(actions.MOVE, this.currentState);
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
  }

  selected() {
    Track.selected = this;
    document.body.classList.add('has-selection');
    this.layer.elem.classList.add('has-selected');
    this.elem.classList.add('selected');
    Object.keys(this.keys).forEach(id => {
      if (!this.keys[id].length) {
        this.keyWrapper.removeChild(this.keys[id].elem);
        delete this.keys[id];
      }
    });
    this.displayProperties();
    this.props.handler = this.change;
    this.props.keyHandler = this.keyChange;
    propertiesList.appendChild(this.props.elem);
  }

  unselected() {
    Track.selected = null;
    document.body.classList.remove('has-selection');
    this.layer.elem.classList.remove('has-selected');
    this.elem.classList.remove('selected');
    propertiesList.removeChild(this.props.elem);
    if (this.selectedKeys) {
      this.selectedKeys.forEach(key => {
        key.elem.classList.remove('select');
      });
      this.selectedKeys = null;
    }
  }

  // new track is to right of split point
  // `time` is relative to track start
  splitAt(time, logThis = true) {
    if (time < MIN_LENGTH || time >= this.length - MIN_LENGTH) return;
    if (logThis) log(actions.SPLIT);
    const newTrack = this.source.createTrack();
    newTrack.setProps(this.toJSON());
    newTrack.setLeftSide(this.start + time);
    newTrack.removeOutOfBoundKeys();
    newTrack.updateLength();
    this.layer.addTrack(newTrack);
    this.length = time;
    this.updateLength();
    this.removeOutOfBoundKeys();
  }

  remove(reason) {
    if (reason !== 'layer-removal') {
      if (this.elem.parentNode) {
        this.elem.parentNode.removeChild(this.elem);
      }
      if (this.layer) {
        if (reason !== 'range-delete') log(actions.REMOVE, this.currentState || getEntry());
        this.layer.tracks.splice(this.index, 1);
        this.layer.updateTracks();
      }
    }
    if (Track.selected === this) {
      this.unselected();
    }
    const index = this.source.tracks.indexOf(this);
    if (~index) this.source.tracks.splice(index, 1);
  }

  change(prop, value, isFinal) {
    if (isFinal) {
      log(actions.PROP_CHANGE, this.propChangesLog);
      this.propChangesLog = null;
    } else if (!this.propChangesLog) {
      this.propChangesLog = getEntry();
    }
    const returnVal = this.showChange(prop, value, isFinal);
    if (returnVal !== undefined) value = returnVal;
    this[prop] = value;
    if (this.keys[prop] && this.keys[prop].length) {
      const relTime = clamp(previewTime - this.start, 0, this.length);
      const key = this.keys[prop].find(({time}) => time === relTime);
      if (key) {
        key.value = value;
      } else {
        const key = this.createKey(prop, {value, time: relTime});
        this.insertKey(prop, key);
        this.props.keys[prop].classList.add('active');
        this.keys[prop].icon.set(key.ease, key);
        this.keys[prop].iconBtn.disabled = false;
      }
    }
    rerender();
    return returnVal;
  }

  showChange(prop, value, isFinal) {
    let returnVal;
    switch (prop) {
      case 'start':
        if (value < 0) value = returnVal = 0;
        this.start = value;
        if (isFinal) {
          this.layer.tracks.splice(this.index, 1);
          const intersections = this.layer.tracksBetween(value, value + this.length);
          if (intersections.length) {
            this.layer.updateTracks();
            const newLayer = new Layer();
            this.layer.insertBefore(newLayer);
            newLayer.addTrack(this);
          } else {
            this.layer.addTrack(this);
          }
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
          this.removeOutOfBoundKeys();
        }
        this.length = value;
        this.updateLength();
        break;
    }
    return returnVal;
  }

  removeOutOfBoundKeys() {
    Object.values(this.keys).forEach(keys => {
      const outOfBound = keys.findIndex(({time}) => time > this.length || time < 0);
      if (~outOfBound) {
        keys.splice(outOfBound, keys.length - outOfBound)
          .forEach(key => {
            keys.elem.removeChild(key.elem);
          });
      }
    });
  }

  createKey(id, key) {
    key.elem = Elem('div', {
      className: 'key-dot',
      style: {
        left: key.time * scale + 'px'
      },
      data: {
        id,
        time: key.time
      }
    });
    return key;
  }

  createKeyRow(id, keys = []) {
    keys.icon = new EaseIcon();
    keys.elem = Elem('div', {className: 'key-row'}, [
      Elem('div', {className: 'key-label'}, [
        this.props.props.find(p => p.id === id).label,
        keys.iconBtn = Elem('button', {
          className: 'key-ease',
          onclick: e => {
            const rect = keys.iconBtn.getBoundingClientRect();
            easingEditor.set(keys.icon.fn);
            easingEditor.onchange = fn => {
              log(actions.EASE_CHANGE);
              keys.icon.metadata.ease = fn;
              if (this.selectedKeys) {
                this.selectedKeys.forEach(key => key.ease = fn);
              }
              this.displayProperties();
            };
            easingEditor.open(rect);
          }
        }, [keys.icon.svg])
      ]),
      ...keys.map(({elem}) => elem)
    ]);
    return keys;
  }

  keyChange(id, keyed) {
    log(keyed ? actions.KEY : actions.UNKEY);
    const relTime = clamp(previewTime - this.start, 0, this.length);
    if (keyed) {
      const key = this.createKey(id, {value: this[id], time: relTime});
      this.insertKey(id, key);
      this.keys[id].icon.set(key.ease, key);
      this.keys[id].iconBtn.disabled = false;
    } else {
      const index = this.keys[id].findIndex(({time}) => time === relTime);
      if (~index) {
        this.keys[id].elem.removeChild(this.keys[id][index].elem);
        this.keys[id].splice(index, 1);
      } else {
        console.log('could not find key yet it said there was key');
      }
      this.keys[id].iconBtn.disabled = true;
    }
  }

  // assumes key is new, so it sets ease accordingly
  insertKey(id, key) {
    if (!this.keys[id]) {
      this.keys[id] = this.createKeyRow(id);
      this.keyWrapper.appendChild(this.keys[id].elem);
    }
    const keys = this.keys[id];
    keys.elem.appendChild(key.elem);
    const index = keys.findIndex(({time}) => time > key.time);
    key.ease = easingEditor.fn;
    if (~index) {
      if (index > 0) key.ease = keys[index - 1].ease;
      keys.splice(index, 0, key);
    } else {
      if (keys.length) key.ease = keys[keys.length - 1].ease;
      keys.push(key);
    }
  }

  deleteSelected() {
    if (this.selectedKeys) {
      log(actions.DELETE_KEYS);
      Object.keys(this.keys).forEach(id => {
        const keys = this.keys[id];
        for (let i = keys.length; i--;) {
          if (this.selectedKeys.includes(keys[i])) {
            keys.elem.removeChild(keys[i].elem);
            keys.splice(i, 1);
          }
        }
      });
      this.selectedKeys = null;
      rerender();
      this.displayProperties();
    }
  }

  displayProperties() {
    if (Track.selected === this) {
      const relTime = clamp(previewTime - this.start, 0, this.length);
      this.interpolate(relTime);
      this.props.setValues(this);
      this.props.props.forEach(({id, animatable}) => {
        if (animatable) {
          if (this.keys[id]) {
            const key = this.keys[id].find(({time}) => time === relTime);
            if (key) {
              this.props.keys[id].classList.add('active');
              this.keys[id].icon.set(key.ease, key);
              this.keys[id].iconBtn.disabled = false;
            } else {
              this.props.keys[id].classList.remove('active');
              this.keys[id].iconBtn.disabled = true;
            }
          }
        }
      });
    }
  }

  prepare() {
    return Promise.resolve();
  }

  interpolate(relTime) {
    Object.keys(this.keys).forEach(id => {
      const keys = this.keys[id];
      if (keys.length === 1) {
        this[id] = keys[0].value;
      } else if (keys.length > 1) {
        const index = keys.findIndex(({time}) => time >= relTime);
        if (!~index) {
          this[id] = keys[keys.length - 1].value;
        } else if (keys[index].time === relTime || index === 0) {
          this[id] = keys[index].value;
        } else {
          this[id] = keys[index - 1].value + interpolate(
            (relTime - keys[index - 1].time) / (keys[index].time - keys[index - 1].time),
            keys[index].ease
          ) * (keys[index].value - keys[index - 1].value);
        }
      }
    });
  }

  render(ctx, time) {
    this.interpolate(time);
  }

  stop() {
    // do nothing
  }

  setProps(values) {
    this.props.props.forEach(({id}) => {
      if (values[id] !== undefined) {
        this[id] = values[id];
      }
    });
    Object.keys(values.keys).forEach(id => {
      this.keys[id] = this.createKeyRow(id, values.keys[id].map(key => this.createKey(id, key)));
      this.keyWrapper.appendChild(this.keys[id].elem);
    });
  }

  toJSON() {
    const keys = {};
    Object.keys(this.keys).forEach(id => {
      if (this.keys[id].length) {
        keys[id] = this.keys[id].map(({time, value, ease}) => ({time, value, ease}));
      }
    });
    const obj = {
      source: this.source.id,
      selected: Track.selected === this,
      keys
    };
    this.props.props.forEach(({id}) => obj[id] = this[id]);
    return obj;
  }

  // returns jumpPoint relative to currentTime regardless of point it snaps to
  static snapPoint(jumpPoints, ...times) {
    let jumpPoint = times[0], minDist = Infinity;
    jumpPoints.forEach(point => {
      times.forEach(time => {
        const dist = Math.abs(time - point);
        if (dist < SNAP_DIST / scale && dist < minDist) {
          jumpPoint = point - (time - times[0]);
          minDist = dist;
        }
      });
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
    this.shiftAllKeys(this.start - start);
    this.trimStart = this.trimStart + start - this.start;
    this.start = start;
  }

  updateLength() {
    super.updateLength();
    this.elem.style.backgroundPositionX = -this.trimStart * scale + 'px';
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
        break;
      case 'trimStart':
        if (value > this.trimEnd - MIN_LENGTH) this.trimStart = returnVal = this.trimEnd - MIN_LENGTH;
        if (isFinal) {
          if (this.index < this.layer.tracks.length - 1) {
            if (this.layer.tracks[this.index + 1].start < this.start + this.trimEnd - value) {
              value = returnVal = this.trimEnd - this.layer.tracks[this.index + 1].start + this.start;
            }
          }
          this.removeOutOfBoundKeys();
        }
        this.trimStart = value;
        this.updateLength();
        break;
      case 'trimEnd':
        if (value < this.trimStart + MIN_LENGTH) value = returnVal = this.trimStart + MIN_LENGTH;
        if (isFinal) {
          if (this.index < this.layer.tracks.length - 1) {
            if (this.layer.tracks[this.index + 1].start < this.start + value - this.trimStart) {
              value = returnVal = this.trimStart + this.layer.tracks[this.index + 1].start - this.start;
            }
          }
          this.removeOutOfBoundKeys();
        }
        this.trimEnd = value;
        this.updateLength();
        break;
      default:
        return super.showChange(prop, value, isFinal);
    }
    return returnVal;
  }

  prepare(relTime) {
    return new Promise(res => {
      this.media.addEventListener('timeupdate', res, {once: true});
      this.media.currentTime = mod(relTime + this.trimStart, this.source.length);
    });
  }

  render(ctx, time, play = false) {
    super.render(ctx, time, play);
    this.media.volume = this.volume / 100;
    if (play) this.media.play();
  }

  stop() {
    this.media.pause();
  }

}

class VideoTrack extends MediaTrack {

  static get props() {
    return this._props || (this._props = new Properties([
      ...baseProps,
      ...mediaProps,
      ...graphicalProps,
      fitProp
    ]));
  }

  constructor(source) {
    super(source, VideoTrack.props);
    this.elem.classList.add('video');
    let videoLoaded;
    this.mediaLoaded = new Promise(res => videoLoaded = res);
    this.media = Elem('video', {
      src: this.source.url,
      loop: true,
      onloadeddata: e => {
        if (this.media.readyState < 2) return;
        videoLoaded();
      }
    });
  }

  showChange(prop, value, isFinal) {
    let returnVal;
    switch (prop) {
      case 'opacity':
        if (value > 100) return 100;
        else if (value < 0) return 0;
      default:
        return super.showChange(prop, value, isFinal);
    }
    return returnVal;
  }

  render(ctx, time, play = false) {
    super.render(ctx, time, play);
    ctx.save();
    ctx.translate(ctx.canvas.width * (this.xPos + 1) / 2, ctx.canvas.height * (1 - this.yPos) / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.scale(this.xScale, this.yScale);
    ctx.globalAlpha = this.opacity / 100;
    let width = ctx.canvas.width, height = ctx.canvas.height;
    if (this.fit !== 'stretch') {
      if (this.source.width / this.source.height > ctx.canvas.width / ctx.canvas.height) {
        // source is wider
        if (this.fit === 'cover') {
          width = ctx.canvas.height / this.source.height * this.source.width;
          height = ctx.canvas.height;
        } else {
          width = ctx.canvas.width;
          height = ctx.canvas.width / this.source.width * this.source.height;
        }
      } else {
        // source is taller
        if (this.fit === 'cover') {
          width = ctx.canvas.width;
          height = ctx.canvas.width / this.source.width * this.source.height;
        } else {
          width = ctx.canvas.height / this.source.height * this.source.width;
          height = ctx.canvas.height;
        }
      }
    }
    ctx.drawImage(this.media, -width / 2, -height / 2, width, height);
    ctx.restore();
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
    this.media = new Audio(this.source.url);
    this.mediaLoaded = new Promise(res => this.media.onload = res);
    this.media.loop = true;
  }

  updateScale() {
    super.updateScale();
    this.elem.style.backgroundSize = this.source.length * scale + 'px var(--background-size-y)';
  }

}

class ImageTrack extends Track {

  static get props() {
    return this._props || (this._props = new Properties([
      ...baseProps,
      lengthProp,
      ...graphicalProps,
      fitProp
    ]));
  }

  constructor(source) {
    super(
      source,
      ImageTrack.props
    );
    this.elem.classList.add('image');
  }

  showChange(prop, value, isFinal) {
    let returnVal;
    switch (prop) {
      case 'opacity':
        if (value > 100) return 100;
        else if (value < 0) return 0;
      default:
        return super.showChange(prop, value, isFinal);
    }
    return returnVal;
  }

  render(ctx, time) {
    super.render(ctx, time);
    ctx.save();
    ctx.translate(ctx.canvas.width * (this.xPos + 1) / 2, ctx.canvas.height * (1 - this.yPos) / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.scale(this.xScale, this.yScale);
    ctx.globalAlpha = this.opacity / 100;
    let width = ctx.canvas.width, height = ctx.canvas.height;
    if (this.fit !== 'stretch') {
      if (this.source.width / this.source.height > ctx.canvas.width / ctx.canvas.height) {
        // source is wider
        if (this.fit === 'cover') {
          width = ctx.canvas.height / this.source.height * this.source.width;
          height = ctx.canvas.height;
        } else {
          width = ctx.canvas.width;
          height = ctx.canvas.width / this.source.width * this.source.height;
        }
      } else {
        // source is taller
        if (this.fit === 'cover') {
          width = ctx.canvas.width;
          height = ctx.canvas.width / this.source.width * this.source.height;
        } else {
          width = ctx.canvas.height / this.source.height * this.source.width;
          height = ctx.canvas.height;
        }
      }
    }
    ctx.drawImage(this.source.image, -width / 2, -height / 2, width, height);
    ctx.restore();
  }

}

class TextTrack extends Track {

  static get props() {
    return this._props || (this._props = new Properties([
      ...textProps,
      ...baseProps,
      lengthProp,
      ...graphicalProps,
      ...colourProps
    ]));
  }

  constructor() {
    super(sources.text, TextTrack.props);
    this.elem.classList.add('text');
    this.name.textContent = this.content;

    const [font, weight = '400'] = this.font.split(':');
    if (!fonts[font]) fonts[font] = {};
    fonts[font][weight] = (fonts[font][weight] || 0) + 1;
    updateFonts();
  }

  setProps(values) {
    if (values.font) {
      const [oldFont, oldWeight = '400'] = this.font.split(':');
      const [font, weight = '400'] = values.font.split(':');
      fonts[oldFont][oldWeight]--;
      if (!fonts[font]) fonts[font] = {};
      fonts[font][weight] = (fonts[font][weight] || 0) + 1;
      updateFonts();
    }
    super.setProps(values);
  }

  showChange(prop, value, isFinal) {
    let returnVal;
    switch (prop) {
      case 'font':
        const [oldFont, oldWeight = '400'] = this.font.split(':');
        const [font, weight = '400'] = value.split(':');
        fonts[oldFont][oldWeight]--;
        if (!fonts[font]) fonts[font] = {};
        fonts[font][weight] = (fonts[font][weight] || 0) + 1;
        updateFonts();
        break;
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
    super.render(ctx, time);
    ctx.save();
    ctx.translate(ctx.canvas.width * (this.xPos + 1) / 2, ctx.canvas.height * (1 - this.yPos) / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.scale(this.xScale, this.yScale);
    ctx.fillStyle = `hsla(${mod(this.hColour, 360)}, ${this.sColour}%, ${this.lColour}%, ${this.opacity / 100})`;
    const [font, weight = '400'] = this.font.split(':');
    ctx.font = `${weight} 50px ${font.includes(' ') ? `"${font.replace(/"/g, '\\"')}"` : font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.content, 0, 0);
    ctx.restore();
  }

  remove(reason) {
    super.remove(reason);
    const [font, weight = '400'] = this.font.split(':');
    fonts[font][weight]--;
    updateFonts();
  }

}

class RectTrack extends Track {

  static get props() {
    return this._props || (this._props = new Properties([
      ...baseProps,
      lengthProp,
      ...graphicalProps,
      ...colourProps
    ]));
  }

  constructor() {
    super(sources.rect, RectTrack.props);
    this.elem.classList.add('rect');
    this.name.textContent = 'Rectangle';
  }

  showChange(prop, value, isFinal) {
    let returnVal;
    switch (prop) {
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
    super.render(ctx, time);
    ctx.save();
    ctx.translate(ctx.canvas.width * (this.xPos + 1) / 2, ctx.canvas.height * (1 - this.yPos) / 2);
    ctx.rotate(this.rotation * Math.PI / 180);
    ctx.scale(this.xScale, this.yScale);
    ctx.fillStyle = `hsla(${mod(this.hColour, 360)}, ${this.sColour}%, ${this.lColour}%, ${this.opacity / 100})`;
    ctx.fillRect(-ctx.canvas.width / 2, -ctx.canvas.height / 2, ctx.canvas.width, ctx.canvas.height);
    ctx.restore();
  }

}
