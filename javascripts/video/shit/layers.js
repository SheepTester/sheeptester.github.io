const LAYER_HEIGHT = 40;
const END_PADDING = 20;
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

  getWidth() {
    return this.tracks.length && this.tracks[this.tracks.length - 1].end;
  }

}

let maxLength = 0;
function updateLayers() {
  layers.forEach(layer => {
    const width = layer.getWidth();
    if (width > maxLength) maxLength = width;
  });
  const length = (maxLength + END_PADDING) * scale + 'px';
  layers.forEach((layer, i) => {
    layer.index = i;
    layer.elem.style.top = LAYER_HEIGHT * i + 'px';
    layer.elem.style.width = length;
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

function updateScale() {
  const length = (maxLength + END_PADDING) * scale + 'px';
  layers.forEach(layer => {
    layer.updateScale();
    layer.elem.style.width = length;
  });
}
