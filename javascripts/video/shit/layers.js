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
      arr.push(...track.keys.map(({time}) => track.start + time)); // TODO: is key.time relative or absolute?
    });
    return arr;
  }

  insertBefore(layer) {
    layersWrapper.insertBefore(layer.elem, this.elem);
    layers.splice(this.index, 0, layer);
    updateLayers();
  }

  remove() {
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
}

function previewTimeAt(time = previewTime) {
  Promise.all(layers.map(layer => {
    const track = layer.trackAt(time);
    if (track) {
      if (track.prepare) {
        return track.prepare(time - track.start).then(() => track);
      } else {
        return track;
      }
    }
  }))
    .then(tracks => {
      c.clearRect(0, 0, c.canvas.width, c.canvas.height);
      tracks.forEach(track => track && track.render(c));
    });
  previewTime = time;
  playheadMarker.style.left = time * scale + 'px';
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
    });
    addLayer(layer);
  });
}
