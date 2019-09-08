const layers = [];

class Layer {

  constructor() {
    this.elem = Elem('div', {className: 'layer'});
    this.tracks = [];
  }

  tracksBetween(min, max) {
    return this.tracks.filter(({start, end}) => start < max && end > min);
  }

  trackAt(time) {
    return this.tracks.find(({start, end}) => time >= start && time < end);
  }

  // assumes track.start is set, or should that be an argument?
  addTrack(track) {
    track.layer = this;
    const index = this.tracks.findIndex(({start}) => track.start < start);
    this.tracks.splice(~index ? index : this.tracks.length, 0, track);
    this.elem.appendChild(track.elem);
    this.updateTracks();
    if (this.tracks.length === 1 && this.index === layers.length - 1) {
      // always have an extra layer available
      addLayer();
    }
  }

  updateTracks() {
    this.tracks.forEach((track, i) => {
      track.index = i;
    });
  }

  updateScale() {
    this.tracks.forEach(track => {
      track.updateScale();
    });
  }

  getJumpPoints() {
    const arr = [];
    this.tracks.forEach(track => {
      arr.push(track.start);
      arr.push(track.end);
      Object.values(track.keys).forEach(keys => arr.push(...keys.map(({time}) => track.start + time)));
    });
    return arr;
  }

  insertBefore(layer) {
    layersWrapper.insertBefore(layer.elem, this.elem);
    layers.splice(this.index, 0, layer);
    updateLayers();
  }

  remove() {
    this.tracks.forEach(track => track.remove('layer-removal'));
    layers.splice(this.index, 1);
    layersWrapper.removeChild(this.elem);
  }

}

function updateLayers() {
  layers.forEach((layer, i) => {
    layer.index = i;
  });
}

// made such that the bounds should be subtracted by the scrollY
function getLayerBounds() {
  return layers.map(layer => {
    const {top, bottom} = layer.elem.getBoundingClientRect();
    return {layer, top: top + scrollY, bottom: bottom + scrollY};
  });
}

function getAllJumpPoints() {
  const arr = [];
  layers.forEach(layer => arr.push(...layer.getJumpPoints()));
  arr.sort((a, b) => a - b);
  return arr.filter((t, i) => t !== arr[i + 1]);
}

function addLayer(layer = new Layer()) {
  layersWrapper.appendChild(layer.elem);
  layers.push(layer);
  updateLayers();
}

function updateScale(newScale) {
  const oldScale = scale;
  scale = newScale;
  layers.forEach(layer => layer.updateScale());
  renderScale();
  playheadMarker.style.left = previewTime * scale + 'px';
  scrollWrapper.scrollLeft = (scrollX + windowWidth / 2) / oldScale * scale - windowWidth / 2; // could improve
  zoomOutBtn.disabled = logScale === 0;
  zoomInBtn.disabled = logScale === MAX_SCALE;
}

let previewTimeReady;
// use `setPreviewTime` if you want to set it while playing
function previewTimeAt(time = previewTime, prepare = true) {
  if (time < 0) time = 0;
  previewTime = time;
  playheadMarker.style.left = time * scale + 'px';
  currentSpan.textContent = Math.floor(previewTime / 60) + ':' + ('0' + Math.floor(previewTime % 60)).slice(-2);
  if (prepare) {
    previewTimeReady = Promise.all(layers.map(layer => {
      const track = layer.trackAt(time);
      if (track) {
        return track.prepare(time - track.start);
      }
    }));
    previewTimeReady.then(rerender);
  }
  if (Track.selected) Track.selected.displayProperties();
}

async function rerender() {
  await previewTimeReady;
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  let length = 0;
  layers.forEach(layer => {
    if (layer.tracks.length) {
      const lastTrack = layer.tracks[layer.tracks.length - 1];
      if (lastTrack.end > length) {
        length = lastTrack.end;
      }
    }
    const track = layer.trackAt(previewTime);
    if (track) {
      track.render(c, previewTime - track.start);
      return track;
    }
  });
  editorLength = length;
  lengthSpan.textContent = Math.floor(length / 60) + ':' + ('0' + Math.floor(length % 60)).slice(-2);
}

let playing = false;
async function play() {
  if (playing) return;
  await Promise.all(layers.map(layer => {
    layer.playing = layer.trackAt(previewTime);
    return Promise.all(layer.tracks.map(track => {
      return track === layer.playing
        ? track.prepare(previewTime - track.start).then(() => {
          track.render(c, previewTime - track.start, true);
        })
        : track.prepare(0);
    }));
  }));
  playing = {
    start: Date.now(),
    startTime: previewTime
  };
  playIcon.textContent = 'pause';
  paint();
}
let nextAnimationFrame;
function paint() {
  if (!playing) return;
  nextAnimationFrame = window.requestAnimationFrame(paint);
  previewTimeAt((Date.now() - playing.start) / 1000 + playing.startTime, false);
  c.clearRect(0, 0, c.canvas.width, c.canvas.height);
  layers.forEach(layer => {
    const track = layer.trackAt(previewTime);
    if (track) {
      if (layer.playing === track) {
        track.render(c, previewTime - track.start);
      } else {
        if (layer.playing) layer.playing.stop();
        track.render(c, previewTime - track.start, true);
        layer.playing = track;
      }
    } else if (layer.playing) {
      layer.playing.stop();
      layer.playing = null;
    }
  });
}
function stop() {
  layers.forEach(layer => {
    if (layer.playing) {
      layer.playing.stop();
      layer.playing = null;
    }
  });
  playing = false;
  playIcon.textContent = 'play_arrow';
  window.cancelAnimationFrame(nextAnimationFrame);
}

function clearLayers() {
  while (layers.length) layers[layers.length - 1].remove();
}

function getEntry() {
  return layers.map(layer => layer.tracks.map(track => track.toJSON()));
}

function setEntry(entry) {
  clearLayers();
  entry.forEach(tracks => {
    const layer = new Layer();
    tracks.forEach(data => {
      const track = sources[data.source].createTrack();
      track.setProps(data);
      track.updateLength();
      layer.addTrack(track);
      if (data.selected) track.selected();
    });
    addLayer(layer);
  });
  rerender();
}
