// reconstruction of https://github.com/LLK/scratch-gui/blob/develop/src/containers/sound-editor.jsx

import WavEncoder from './wav-encoder/index.js';
import lamejs from './lame.min.js';

import {computeChunkedRMS} from './audio/audio-util.js';
import AudioEffects from './audio/audio-effects.js';
import AudioBufferPlayer from './audio/audio-buffer-player.js';

import SharedAudioContext from './audio/shared-audio-context.js';

let reverbImpulseResponse, magicImpulseResponse, meowImpulseResponse;
fetch('./audio/york-minster-short.wav').then(r => r.arrayBuffer()).then(b => reverbImpulseResponse = b);
fetch('./audio/magic-spell.wav').then(r => r.arrayBuffer()).then(b => magicImpulseResponse = b);
fetch('./audio/scratch-meow.wav').then(r => r.arrayBuffer()).then(b => meowImpulseResponse = b);

const UNDO_STACK_SIZE = 99;

const HEIGHT = 100;
const DEFAULT_ZOOM = 200;
const MIN_ZOOM = 0.03125;
const MAX_ZOOM = 50;

const MAX_MP3_SAMPLES = 1152;

class SoundEditor {

  constructor(props) {
    [
      'copy',
      'copyCurrentBuffer',
      'handleCopyToNew',
      'handleStoppedPlaying',
      'handlePlay',
      'handleStopPlaying',
      'handleUpdatePlayhead',
      'handleDelete',
      'handleUpdateTrim',
      'handleEffect',
      'handleUndo',
      'handleRedo',
      'submitNewSamples',
      'handleCopy',
      'handlePaste',
      'paste',
      'handleKeyPress',
      'handleRemove',
      'handleDownload',
      'handleDownloadMp3',
      'handleZoomIn',
      'handleZoomOut',
      'handleUpdateZoom'
    ].forEach(method => this[method] = this[method].bind(this));

    this.props = props;
    this.state = {
      playhead: null, // null is not playing, [0 -> 1] is playing percent
      trimStart: 0,
      trimEnd: 0,
      selectDirection: 'end',
      zoom: this.props.sampleRate / DEFAULT_ZOOM
    };

    this.redoStack = [];
    this.undoStack = [];

    this.audioContext = new SharedAudioContext();
    const {effectTypes} = AudioEffects;
    this.impulseResponses = {};
    // HACK to allow reverb-effect to accept different sample rates
    this.audioContext.decodeAudioData(reverbImpulseResponse.slice(0))
      .then(buffer => this.resampleAudioBufferToRate(buffer, this.props.sampleRate))
      .then(buffer => {
        this.impulseResponses[effectTypes.REVERB] = buffer;
      });
    this.audioContext.decodeAudioData(magicImpulseResponse.slice(0))
      .then(buffer => this.resampleAudioBufferToRate(buffer, this.props.sampleRate))
      .then(buffer => {
        this.impulseResponses[effectTypes.MAGIC] = buffer;
      });
    this.audioContext.decodeAudioData(meowImpulseResponse.slice(0))
      .then(buffer => this.resampleAudioBufferToRate(buffer, this.props.sampleRate))
      .then(buffer => {
        this.impulseResponses[effectTypes.MEOW] = buffer;
      });

    this.audioBufferPlayer = new AudioBufferPlayer(this.props.samples, this.props.sampleRate);
    this.audioContext = new SharedAudioContext();

    document.addEventListener('keydown', this.handleKeyPress);
  }

  unmount() {
    this.audioBufferPlayer.stop();

    document.removeEventListener('keydown', this.handleKeyPress);

    if (this.elems.wrapper.parentNode) {
      this.elems.wrapper.parentNode.removeChild(this.elems.wrapper);
    }
  }

  handleKeyPress(event) {
    if (event.target instanceof HTMLInputElement) {
      // Ignore keyboard shortcuts if a text input field is focused
      return;
    }
    if (!this.elems.wrapper.contains(event.target)) {
      // Ignore keyboard shortcuts if a different editor is focused
      return;
    }
    if (event.key === ' ') {
      event.preventDefault();
      if (this.state.playhead) {
        this.handleStopPlaying();
      } else {
        this.handlePlay();
      }
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      if (event.shiftKey) {
        this.handleDeleteInverse();
      } else {
        this.handleDelete();
      }
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      this.handleUpdateTrim(null, null);
    }
    const start = this.state.trimStart;
    const end = this.state.trimEnd;
    if (event.key === 'ArrowLeft') {
      if (event.metaKey || event.ctrlKey) {
        if (event.shiftKey) this.handleUpdateTrim(0, end);
        else if (start === end) this.handleUpdateTrim(0, 0);
        else this.handleUpdateTrim(start, start);
      } else {
        if (event.shiftKey) {
          if (this.state.selectDirection === 'start') {
            this.handleUpdateTrim(start - 0.01, end);
          } else if (end - 0.01 < start) {
            this.handleUpdateTrim(end - 0.01, start);
            this.state.selectDirection = 'start';
          } else {
            this.handleUpdateTrim(start, end - 0.01);
          }
        } else {
          this.handleUpdateTrim(start - 0.01, end - 0.01);
        }
      }
    }
    if (event.key === 'ArrowRight') {
      if (event.metaKey || event.ctrlKey) {
        if (event.shiftKey) this.handleUpdateTrim(start, 1);
        else if (start === end) this.handleUpdateTrim(1, 1);
        else this.handleUpdateTrim(end, end);
      } else {
        if (event.shiftKey) {
          if (this.state.selectDirection === 'end') {
            this.handleUpdateTrim(start, end + 0.01);
          } else if (end < start + 0.01) {
            this.handleUpdateTrim(end, start + 0.01);
            this.state.selectDirection = 'end';
          } else {
            this.handleUpdateTrim(start + 0.01, end);
          }
        } else {
          this.handleUpdateTrim(start + 0.01, end + 0.01);
        }
      }
    }
    if (event.metaKey || event.ctrlKey) {
      if (event.shiftKey && event.key.toLowerCase() === 'z' || event.key === 'y') {
        event.preventDefault();
        if (this.redoStack.length > 0) {
          this.handleRedo();
        }
      } else if (event.key === 'z') {
        if (this.undoStack.length > 0) {
          event.preventDefault();
          this.handleUndo();
        }
      } else if (event.key === 'x') {
        this.handleCopy();
        this.handleDelete();
      } else if (event.key === 'c') {
        event.preventDefault();
        this.handleCopy();
      } else if (event.key === 'v') {
        event.preventDefault();
        this.handlePaste();
      } else if (event.key === 'a') {
        event.preventDefault();
        this.handleUpdateTrim(0, 1);
      } else if (event.key === 's') {
        event.preventDefault();
        if (event.altKey) this.handleDownloadMp3();
        else this.handleDownload();
      }
    }
  }

  resetState(samples, sampleRate) {
    this.audioBufferPlayer.stop();
    this.audioBufferPlayer = new AudioBufferPlayer(samples, sampleRate);
    this.state = {
      playhead: null,
      trimStart: this.state.trimStart,
      trimEnd: this.state.trimEnd,
      selectDirection: this.state.selectDirection,
      zoom: this.state.zoom
    };
    this.renderWaveform(samples);
    this.displayLength();
    this.elems.redoBtn.disabled = !this.redoStack.length;
    this.elems.undoBtn.disabled = !this.undoStack.length;
  }

  submitNewSamples(samples, sampleRate, skipUndo) {
    if (!skipUndo) {
      this.redoStack = [];
      if (this.undoStack.length >= UNDO_STACK_SIZE) {
        this.undoStack.shift(); // Drop the first element off the array
      }
      this.undoStack.push(this.getUndoItem());
    }
    this.resetState(samples, sampleRate);
  }

  handlePlay() {
    this.audioBufferPlayer.stop();
    this.audioBufferPlayer.play(
      this.state.trimStart || 0,
      this.state.trimStart === this.state.trimEnd ? 1 : this.state.trimEnd || 1,
      this.handleUpdatePlayhead,
      this.handleStoppedPlaying
    );

    this.elems.playBtn.disabled = true;
    this.elems.stopBtn.disabled = false;
    this.elems.playhead.style.display = 'block';
  }

  handleStopPlaying() {
    this.audioBufferPlayer.stop();
    this.handleStoppedPlaying();
  }

  handleStoppedPlaying() {
    this.elems.playBtn.disabled = false;
    this.elems.stopBtn.disabled = true;
    this.elems.playhead.style.display = null;
    this.state.playhead = null;
  }

  handleUpdatePlayhead(playhead) {
    this.elems.playhead.style.left = playhead * 100 + '%';
    this.state.playhead = playhead;
  }

  handleDelete() {
    const {samples, sampleRate} = this.copyCurrentBuffer();
    const sampleCount = samples.length;
    const startIndex = Math.floor(this.state.trimStart * sampleCount);
    const endIndex = Math.floor(this.state.trimEnd * sampleCount);
    const firstPart = samples.slice(0, startIndex);
    const secondPart = samples.slice(endIndex, sampleCount);
    const newLength = firstPart.length + secondPart.length;
    let newSamples;
    if (newLength === 0) {
      newSamples = new Float32Array(1);
    } else {
      newSamples = new Float32Array(newLength);
      newSamples.set(firstPart, 0);
      newSamples.set(secondPart, firstPart.length);
    }
    this.submitNewSamples(newSamples, sampleRate);
    const trimPos = firstPart.length / newLength;
    this.handleUpdateTrim(trimPos, trimPos);
  }

  handleDeleteInverse() {
    const {samples, sampleRate} = this.copyCurrentBuffer();
    const sampleCount = samples.length;
    const startIndex = Math.floor(this.state.trimStart * sampleCount);
    const endIndex = Math.floor(this.state.trimEnd * sampleCount);
    let clippedSamples = samples.slice(startIndex, endIndex);
    if (clippedSamples.length === 0) {
      clippedSamples = new Float32Array(1);
    }
    this.submitNewSamples(clippedSamples, sampleRate);
    this.handleUpdateTrim(0, 1);
  }

  handleUpdateTrim(trimStart, trimEnd) {
    if (trimStart < 0) trimStart = 0;
    if (trimEnd < 0) trimEnd = 0;
    if (trimStart > 1) trimStart = 1;
    if (trimEnd > 1) trimEnd = 1;
    else if (trimEnd < trimStart) throw new Error("smh that's not my job")
    const buffer = this.copyCurrentBuffer();
    this.elems.trim.style.left = trimStart * 100 + '%';
    this.elems.trim.dataset.leftTime = (trimStart * buffer.samples.length / buffer.sampleRate).toFixed(2) + 's';
    this.state.trimStart = trimStart;
    this.elems.trim.style.right = (1 - trimEnd) * 100 + '%';
    this.elems.trim.dataset.rightTime = (trimEnd * buffer.samples.length / buffer.sampleRate).toFixed(2) + 's';
    this.state.trimEnd = trimEnd;
    this.handleStopPlaying();
  }

  effectFactory(name) {
    return () => this.handleEffect(name);
  }

  copyCurrentBuffer() {
    // Cannot reliably use props.samples because it gets detached by Firefox
    return {
      samples: this.audioBufferPlayer.buffer.getChannelData(0),
      sampleRate: this.audioBufferPlayer.buffer.sampleRate
    };
  }

  handleEffect(name) {
    const trimStart = this.state.trimStart === null ? 0.0 : this.state.trimStart;
    const trimEnd = this.state.trimEnd === null ? 1.0 : this.state.trimEnd;

    // Offline audio context needs at least 2 samples
    if (this.audioBufferPlayer.buffer.length < 2) {
      return;
    }

    const effects = new AudioEffects(this.audioBufferPlayer.buffer, name, trimStart, trimEnd,  this.impulseResponses);
    effects.process((renderedBuffer, adjustedTrimStart, adjustedTrimEnd) => {
      const samples = renderedBuffer.getChannelData(0);
      const sampleRate = renderedBuffer.sampleRate;
      this.submitNewSamples(samples, sampleRate);
      this.handleUpdateTrim(adjustedTrimStart, adjustedTrimEnd);
      this.handlePlay();
    });
  }

  getUndoItem() {
    return {
      ...this.copyCurrentBuffer(),
      trimStart: this.state.trimStart,
      trimEnd: this.state.trimEnd
    };
  }

  handleUndo() {
    this.redoStack.push(this.getUndoItem());
    const {samples, sampleRate, trimStart, trimEnd} = this.undoStack.pop();
    if (samples) {
      this.submitNewSamples(samples, sampleRate, true);
      this.handleUpdateTrim(trimStart, trimEnd);
      this.handlePlay();
    }
  }

  handleRedo() {
    const {samples, sampleRate, trimStart, trimEnd} = this.redoStack.pop();
    if (samples) {
      this.undoStack.push(this.getUndoItem());
      this.submitNewSamples(samples, sampleRate, true);
      this.handleUpdateTrim(trimStart, trimEnd);
      this.handlePlay();
    }
  }

  handleCopy() {
    this.copy();
  }

  copy(callback) {
    const trimStart = this.state.trimStart === null ? 0.0 : this.state.trimStart;
    const trimEnd = this.state.trimEnd === null ? 1.0 : this.state.trimEnd;

    const newCopyBuffer = this.copyCurrentBuffer();
    const trimStartSamples = trimStart * newCopyBuffer.samples.length;
    const trimEndSamples = trimEnd * newCopyBuffer.samples.length;
    newCopyBuffer.samples = newCopyBuffer.samples.slice(trimStartSamples, trimEndSamples);

    this.props.clipboard.copyBuffer = newCopyBuffer;
    if (callback) callback();
  }

  handleCopyToNew() {
    this.copy(() => {
      const {samples, sampleRate} = this.props.clipboard.copyBuffer;
      this.props.addSound(
        'Copy of ' + this.elems.name.value,
        samples,
        sampleRate
      );
    });
  }

  resampleBufferToRate(buffer, newRate) {
    return new Promise(resolve => {
      if (window.OfflineAudioContext) {
        const sampleRateRatio = newRate / buffer.sampleRate;
        const newLength = sampleRateRatio * buffer.samples.length;
        const offlineContext = new window.OfflineAudioContext(1, newLength, newRate);
        const source = offlineContext.createBufferSource();
        const audioBuffer = this.audioContext.createBuffer(1, buffer.samples.length, buffer.sampleRate);
        audioBuffer.getChannelData(0).set(buffer.samples);
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();
        offlineContext.startRendering();
        offlineContext.oncomplete = ({renderedBuffer}) => {
          resolve({
            samples: renderedBuffer.getChannelData(0),
            sampleRate: newRate
          });
        };
      }
    });
  }

  resampleAudioBufferToRate(buffer, newRate) {
    return new Promise(resolve => {
      if (window.OfflineAudioContext) {
        const sampleRateRatio = newRate / buffer.sampleRate;
        const samples = buffer.getChannelData(0);
        const newLength = sampleRateRatio * samples.length;
        const offlineContext = new window.OfflineAudioContext(1, newLength, newRate);
        const source = offlineContext.createBufferSource();
        const audioBuffer = this.audioContext.createBuffer(1, samples.length, buffer.sampleRate);
        audioBuffer.getChannelData(0).set(samples);
        source.buffer = audioBuffer;
        source.connect(offlineContext.destination);
        source.start();
        offlineContext.startRendering();
        offlineContext.oncomplete = ({renderedBuffer}) => resolve(renderedBuffer);
      }
    });
  }

  paste() {
    const {samples} = this.copyCurrentBuffer();
    const trimStartSamples = this.state.trimStart * samples.length;
    const trimEndSamples = this.state.trimEnd * samples.length;
    const firstPart = samples.slice(0, trimStartSamples);
    const lastPart = samples.slice(trimEndSamples);
    const newLength = firstPart.length + this.props.clipboard.copyBuffer.samples.length + lastPart.length;
    const newSamples = new Float32Array(newLength);
    newSamples.set(firstPart, 0);
    newSamples.set(this.props.clipboard.copyBuffer.samples, firstPart.length);
    newSamples.set(lastPart, firstPart.length + this.props.clipboard.copyBuffer.samples.length);

    const trimStartSeconds = trimStartSamples / this.props.sampleRate;
    const trimEndSeconds = trimStartSeconds +
        (this.props.clipboard.copyBuffer.samples.length / this.props.clipboard.copyBuffer.sampleRate);
    const newDurationSeconds = newSamples.length / this.props.clipboard.copyBuffer.sampleRate;
    const adjustedTrimStart = trimStartSeconds / newDurationSeconds;
    const adjustedTrimEnd = trimEndSeconds / newDurationSeconds;
    this.submitNewSamples(newSamples, this.props.sampleRate, false);
    this.handleUpdateTrim(adjustedTrimStart, adjustedTrimEnd);
    this.handlePlay();
  }

  handlePaste() {
    if (!this.props.clipboard.copyBuffer) return;
    if (this.props.clipboard.copyBuffer.sampleRate === this.props.sampleRate) {
      this.paste();
    } else {
      this.resampleBufferToRate(this.props.clipboard.copyBuffer, this.props.sampleRate).then(buffer => {
        this.props.clipboard.copyBuffer = buffer;
        this.paste();
      });
    }
  }

  download(content, type) {
    const saveLink = document.createElement('a');
    document.body.appendChild(saveLink);

    const filename = `${this.elems.name.value}.${type}`;

    // Use special ms version if available to get it working on Edge.
    if (navigator.msSaveOrOpenBlob) {
      navigator.msSaveOrOpenBlob(content, filename);
      return;
    }

    const url = window.URL.createObjectURL(content);
    saveLink.href = url;
    saveLink.download = filename;
    saveLink.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(saveLink);
  }

  handleDownload() {
    try {
      const {samples, sampleRate} = this.copyCurrentBuffer();
      const wavBuffer = WavEncoder.encode.sync({
        sampleRate: sampleRate,
        channelData: [samples]
      });
      const content = new Blob([wavBuffer], {type: 'audio/wav'});
      this.download(content, 'wav');
    } catch (e) {
      console.log(e);
    }
  }

  handleDownloadMp3() {
    try {
      const {samples: floatSamples, sampleRate} = this.copyCurrentBuffer();

      // from https://github.com/zhuker/lamejs/issues/55#issuecomment-417944979
      const samples = new Int16Array(floatSamples.length);
      for (let i = 0; i < floatSamples.length; i++) {
        samples[i] = (floatSamples[i] < 0 ? 0x8000 : 0x7fff) * floatSamples[i];
      }

      const encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
      const result = [];
      for (let i = 0; i < samples.length; i += MAX_MP3_SAMPLES) {
        const buffer = encoder.encodeBuffer(samples.subarray(i, i + MAX_MP3_SAMPLES));
        if (buffer.length > 0) {
          result.push(new Int8Array(buffer));
        }
      }
      const buffer = encoder.flush();
      if (buffer.length > 0) {
        result.push(new Int8Array(buffer));
      }
      const content = new Blob(result, {type: 'audio/mp3'});
      this.download(content, 'mp3');
    } catch (e) {
      console.log(e);
    }
  }

  handleRemove() {
    if (confirm('Are you sure you want to remove this sound?')) {
      this.unmount();
    }
  }

  renderWaveform(samples) {
    const chunkLevels = computeChunkedRMS(samples, this.state.zoom);
    const canvas = this.elems.waveform;
    const c = this.elems.waveformContext;
    const levels = chunkLevels.length;
    canvas.width = levels;
    const waveHeight = HEIGHT / 3;
    c.fillStyle = '#333';
    chunkLevels.forEach((v, i) => {
      c.fillRect(i, Math.floor(HEIGHT / 2 - v * waveHeight), 1, Math.ceil(v * waveHeight * 2));
    });
  }

  displayLength() {
    const {samples, sampleRate} = this.copyCurrentBuffer();
    const sampleCount = samples.length;
    this.elems.length.textContent = (sampleCount / sampleRate).toFixed(2) + 's';
  }

  handleZoomIn() {
    this.state.zoom /= 2;
    this.handleUpdateZoom();
  }

  handleZoomOut() {
    this.state.zoom *= 2;
    this.handleUpdateZoom();
  }

  handleUpdateZoom() {
    const {samples, sampleRate} = this.copyCurrentBuffer();

    const baseZoom = sampleRate / DEFAULT_ZOOM;
    const zoomFactor = baseZoom / this.state.zoom;
    if (zoomFactor < MIN_ZOOM) this.state.zoom = baseZoom / MIN_ZOOM;
    if (zoomFactor > MAX_ZOOM) this.state.zoom = baseZoom / MAX_ZOOM;
    if (this.state.zoom < 1) this.state.zoom = 1;

    // not using zoomFactor because .zoom changes
    this.elems.zoomDisplay.textContent = baseZoom / this.state.zoom * 100 + '%';
    this.renderWaveform(samples);
  }

  render() {
    const {effectTypes} = AudioEffects;
    const elems = {};
    this.elems = elems;
    elems.waveform = Elem('canvas', {
      className: 'waveform',
      height: HEIGHT
    });
    elems.waveformContext = elems.waveform.getContext('2d');
    let thatWasAFinger;
    const trimHandles = e => {
      const isTouch = e.type.includes('touch');
      if (isTouch) thatWasAFinger = true;
      else if (thatWasAFinger) {
        thatWasAFinger = false;
        return;
      }
      const rect = elems.waveform.getBoundingClientRect();
      const pointerID = isTouch && e.changedTouches[0].identifier;
      const pointer = isTouch ? e.touches[pointerID] : e;
      const initialPosition = e.shiftKey
        ? (this.state.selectDirection === 'end'
          ? this.state.trimStart
          : this.state.trimEnd)
        : (pointer.clientX - rect.left) / rect.width;
      const updatePosition = e => {
        const rect = elems.waveform.getBoundingClientRect();
        const pointer = isTouch ? e.touches[pointerID] : e;
        const position = (pointer.clientX - rect.left) / rect.width;
        if (position < initialPosition) {
          this.state.selectDirection = 'start';
          this.handleUpdateTrim(position, initialPosition);
        } else {
          this.state.selectDirection = 'end';
          this.handleUpdateTrim(initialPosition, position);
        }
      }
      if (e.shiftKey) {
        updatePosition(e);
      } else {
        this.handleUpdateTrim(initialPosition, initialPosition);
      }
      document.addEventListener(isTouch ? 'touchmove' : 'mousemove', updatePosition);
      document.addEventListener(isTouch ? 'touchend' : 'mouseup', e => {
        document.removeEventListener(isTouch ? 'touchmove' : 'mousemove', updatePosition);
      }, {once: true});
    };
    return elems.wrapper = Elem('div', {
      className: 'sound-editor',
      tabindex: 0
    }, [
      elems.name = Elem('input', {
        className: 'name-input',
        type: 'text',
        value: this.props.name
      }),
      elems.zoomOut = Elem('button', {
        className: 'zoom-btn',
        onclick: this.handleZoomOut
      }, ['-']),
      elems.zoomDisplay = Elem('span', {
        className: 'zoom-display'
      }),
      elems.zoomIn = Elem('button', {
        className: 'zoom-btn',
        onclick: this.handleZoomIn
      }, ['+']),
      elems.downloadBtn = Elem('button', {
        className: 'download-btn',
        onclick: this.handleDownload
      }, ['download as wav']),
      elems.downloadBtn = Elem('button', {
        className: 'download-btn',
        onclick: this.handleDownloadMp3
      }, ['download as mp3']),
      elems.downloadBtn = Elem('button', {
        className: 'delete-btn',
        onclick: this.handleRemove
      }, ['remove']),
      elems.length = Elem('span', {className: 'sound-length'}),
      elems.preview = Elem('div', {
        className: 'preview',
        onwheel: e => {
          if (e.ctrlKey || e.metaKey) {
            if (e.deltaY > 0) {
              this.state.zoom *= e.deltaY / 500 + 1;
            } else {
              this.state.zoom /= -e.deltaY / 500 + 1;
            }
            this.handleUpdateZoom();
            e.preventDefault();
          }
        }
      }, [Elem('div', {
        className: 'waveform-wrapper',
        onmousedown: trimHandles,
        ontouchstart: trimHandles
      }, [
        elems.waveform,
        elems.playhead = Elem('div', {className: 'playhead'}),
        elems.trim = Elem('div', {className: 'selection-range'})
      ])]),
      elems.playBtn = Elem('button', {
        className: 'play-btn',
        onclick: this.handlePlay
      }, ['play']),
      elems.stopBtn = Elem('button', {
        className: 'stop-btn',
        disabled: true,
        onclick: this.handleStopPlaying
      }, ['stop']),
      elems.edit = Select('Edit', [
        ['cut (ctrl + X)', () => {
          this.handleCopy();
          this.handleDelete();
        }],
        ['copy (ctrl + C)', this.handleCopy],
        ['paste (ctrl + V)', this.handlePaste],
        ['---'],
        ['delete (backspace)', this.handleDelete],
        ['select all (ctrl + A)', () => {
          this.handleUpdateTrim(0, 1);
        }],
        ['trim (shift + backspace)', () => {
          this.handleDeleteInverse();
        }]
      ]),
      elems.effects = Select('Effects', [
        ['reverse', this.effectFactory(effectTypes.REVERSE)],
        ['---'],
        ['slower', this.effectFactory(effectTypes.SLOWER)],
        ['faster', this.effectFactory(effectTypes.FASTER)],
        ['softer', this.effectFactory(effectTypes.SOFTER)],
        ['louder', this.effectFactory(effectTypes.LOUDER)],
        ['mute', this.effectFactory(effectTypes.MUTE)],
        ['fade in', this.effectFactory(effectTypes.FADEIN)],
        ['fade out', this.effectFactory(effectTypes.FADEOUT)],
        ['---'],
        ['robot', this.effectFactory(effectTypes.ROBOT)],
        ['echo', this.effectFactory(effectTypes.ECHO)],
        ['alien', this.effectFactory(effectTypes.ALIEN)],
        ['reverb', this.effectFactory(effectTypes.REVERB)],
        ['magic', this.effectFactory(effectTypes.MAGIC)],
        ['meow', this.effectFactory(effectTypes.MEOW)]
      ]),
      elems.undoBtn = Elem('button', {
        className: 'undo-btn',
        disabled: true,
        onclick: this.handleUndo
      }, ['undo (ctrl + Z)']),
      elems.redoBtn = Elem('button', {
        className: 'redo-btn',
        disabled: true,
        onclick: this.handleRedo
      }, ['redo (ctrl + Y)']),
      Elem('button', {
        className: 'copy-to-new-btn',
        onclick: this.handleCopyToNew
      }, ['copy to new'])
    ]);
  }

}

export default SoundEditor;
