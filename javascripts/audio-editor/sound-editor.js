// reconstruction of https://github.com/LLK/scratch-gui/blob/develop/src/containers/sound-editor.jsx

import WavEncoder from './wav-encoder/index.js';

import {computeChunkedRMS} from './audio/audio-util.js';
import AudioEffects from './audio/audio-effects.js';
import AudioBufferPlayer from './audio/audio-buffer-player.js';

import SharedAudioContext from './audio/shared-audio-context.js';

let reverbImpulseResponse, magicImpulseResponse;
fetch('./audio/york-minster-short.wav').then(r => r.arrayBuffer()).then(b => reverbImpulseResponse = b);
fetch('./audio/magic-spell.wav').then(r => r.arrayBuffer()).then(b => magicImpulseResponse = b);

const UNDO_STACK_SIZE = 99;

const WIDTH = 600;
const HEIGHT = 100;

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
      'handleActivateTrim',
      'handleUpdateTrim',
      'handleEffect',
      'handleUndo',
      'handleRedo',
      'submitNewSamples',
      'handleCopy',
      'handlePaste',
      'paste',
      'handleKeyPress'
    ].forEach(method => this[method] = this[method].bind(this));

    this.props = props;
    this.state = {
      chunkLevels: computeChunkedRMS(this.props.samples),
      playhead: null, // null is not playing, [0 -> 1] is playing percent
      trimStart: 0,
      trimEnd: 0,
      selectDirection: 'end'
    };

    this.redoStack = [];
    this.undoStack = [];

    this.audioContext = new SharedAudioContext();
    const {effectTypes} = AudioEffects;
    this.impulseResponses = {};
    this.audioContext.decodeAudioData(reverbImpulseResponse.slice(0)).then(buffer => {
      this.impulseResponses[effectTypes.REVERB] = buffer;
    });
    this.audioContext.decodeAudioData(magicImpulseResponse.slice(0)).then(buffer => {
      this.impulseResponses[effectTypes.MAGIC] = buffer;
    });

    this.audioBufferPlayer = new AudioBufferPlayer(this.props.samples, this.props.sampleRate);
    this.audioContext = new SharedAudioContext();

    document.addEventListener('keydown', this.handleKeyPress);
  }

  unmount() {
    this.audioBufferPlayer.stop();

    document.removeEventListener('keydown', this.handleKeyPress);
  }

  handleKeyPress(e) {
    if (e.target instanceof HTMLInputElement) {
      // Ignore keyboard shortcuts if a text input field is focused
      return;
    }
    if (!this.elems.wrapper.contains(e.target)) {
      // Ignore keyboard shortcuts if a different editor is focused
      return;
    }
    if (event.key === ' ') {
      if (this.state.playhead) {
        this.handleStopPlaying();
      } else {
        this.handlePlay();
      }
    }
    if (event.key === 'Delete' || event.key === 'Backspace') {
      this.handleActivateTrim();
    }
    if (event.metaKey || event.ctrlKey) {
      if (event.shiftKey && event.key.toLowerCase() === 'z' || event.key === 'y') {
        if (this.redoStack.length > 0) {
          this.handleRedo();
        }
      } else if (event.key === 'z') {
        if (this.undoStack.length > 0) {
          this.handleUndo();
        }
      } else if (event.key === 'x') {
        this.handleCopy();
        this.handleActivateTrim();
      } else if (event.key === 'c') {
        this.handleCopy();
      } else if (event.key === 'v') {
        this.handlePaste();
      } else if (event.key === 'a') {
        this.handleUpdateTrim(0, 1);
      }
    }
  }

  resetState(samples, sampleRate) {
    this.audioBufferPlayer.stop();
    this.audioBufferPlayer = new AudioBufferPlayer(samples, sampleRate);
    this.state = {
      chunkLevels: computeChunkedRMS(samples),
      playhead: null,
      trimStart: this.state.trimStart,
      trimEnd: this.state.trimEnd,
      selectDirection: this.state.selectDirection
    };
    this.renderWaveform();
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

  handlePlay(playToEnd = false) {
    this.elems.playBtn.disabled = true;
    this.elems.stopBtn.disabled = false;
    this.elems.playhead.style.display = 'block';

    this.audioBufferPlayer.stop();
    this.audioBufferPlayer.play(
      this.state.trimStart || 0,
      playToEnd === true ? 1 : this.state.trimEnd || 1,
      this.handleUpdatePlayhead,
      this.handleStoppedPlaying
    );
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

  handleActivateTrim(inverted = false) {
    const {samples, sampleRate} = this.copyCurrentBuffer();
    const sampleCount = samples.length;
    const startIndex = Math.floor(this.state.trimStart * sampleCount);
    const endIndex = Math.floor(this.state.trimEnd * sampleCount);
    let newSamples;
    if (inverted) {
      newSamples = samples.slice(startIndex, endIndex);
      this.handleUpdateTrim(0, 1);
    } else {
      const firstPart = samples.slice(0, startIndex);
      const secondPart = samples.slice(endIndex, sampleCount);
      const newLength = firstPart.length + secondPart.length;
      if (newLength === 0) {
        newSamples = new Float32Array(1);
      } else {
        newSamples = new Float32Array(newLength);
        newSamples.set(firstPart, 0);
        newSamples.set(secondPart, firstPart.length);
      }
      const trimPos = firstPart.length / newLength;
      this.handleUpdateTrim(trimPos, trimPos);
    }
    this.submitNewSamples(newSamples, sampleRate);
  }

  handleUpdateTrim(trimStart, trimEnd) {
    if (trimStart < 0) trimStart = 0;
    if (trimEnd > 1) trimEnd = 1;
    else if (trimEnd < trimStart) throw new Error("smh that's not my job")
    this.elems.trim.style.left = trimStart * 100 + '%';
    this.state.trimStart = trimStart;
    this.elems.trim.style.right = (1 - trimEnd) * 100 + '%';
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

    const effects = new AudioEffects(this.audioBufferPlayer.buffer, name,
      trimStart, trimEnd, this.impulseResponses);
    effects.process((renderedBuffer, adjustedTrimStart, adjustedTrimEnd) => {
      const samples = renderedBuffer.getChannelData(0);
      const sampleRate = renderedBuffer.sampleRate;
      this.submitNewSamples(samples, sampleRate);
      if (this.state.trimStart !== null) {
        this.handleUpdateTrim(adjustedTrimStart, adjustedTrimEnd);
      }
      this.handlePlay();
    });
  }

  getUndoItem() {
    return {
      ...this.copyCurrentBuffer(),
      trimStart: this.state.trimStart,
      trimEnd: this.state.trimEnd,
      selectDirection: this.state.selectDirection
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

    const trimStartSamples = trimStart * this.props.samples.length;
    const trimEndSamples = trimEnd * this.props.samples.length;

    const newCopyBuffer = this.copyCurrentBuffer();
    newCopyBuffer.samples = newCopyBuffer.samples.slice(trimStartSamples, trimEndSamples);

    return this.props.clipboard.copyBuffer = newCopyBuffer;
  }

  handleCopyToNew() {
    this.copy(); // then do something
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

  paste() {
    const copyBuffer = this.props.clipboard.copyBuffer;
    // If there's no selection, paste at the end of the sound
    if (this.state.trimStart === null) {
      const newLength = this.props.samples.length + copyBuffer.samples.length;
      const newSamples = new Float32Array(newLength);
      newSamples.set(this.props.samples, 0);
      newSamples.set(copyBuffer.samples, this.props.samples.length);
      this.submitNewSamples(newSamples, this.props.sampleRate, false);
    } else {
      // else replace the selection with the pasted sound
      const trimStartSamples = this.state.trimStart * this.props.samples.length;
      const trimEndSamples = this.state.trimEnd * this.props.samples.length;
      const firstPart = this.props.samples.slice(0, trimStartSamples);
      const lastPart = this.props.samples.slice(trimEndSamples);
      const newLength = firstPart.length + copyBuffer.samples.length + lastPart.length;
      const newSamples = new Float32Array(newLength);
      newSamples.set(firstPart, 0);
      newSamples.set(copyBuffer.samples, firstPart.length);
      newSamples.set(lastPart, firstPart.length + copyBuffer.samples.length);

      const trimStartSeconds = trimStartSamples / this.props.sampleRate;
      const trimEndSeconds = trimStartSeconds +
          (copyBuffer.samples.length / copyBuffer.sampleRate);
      const newDurationSeconds = newSamples.length / copyBuffer.sampleRate;
      const adjustedTrimStart = trimStartSeconds / newDurationSeconds;
      const adjustedTrimEnd = trimEndSeconds / newDurationSeconds;
      this.handleUpdateTrim(adjustedTrimStart, adjustedTrimEnd);

      this.submitNewSamples(newSamples, this.props.sampleRate, false);
    }

    this.handlePlay();
  }

  handlePaste() {
    const copyBuffer = this.props.clipboard.copyBuffer;
    if (copyBuffer.sampleRate === this.props.sampleRate) {
      this.paste();
    } else {
      console.warn('pasted audio sample rate does not match editor sample rate, resampling');
      this.resampleBufferToRate(copyBuffer, this.props.sampleRate).then(buffer => {
        this.props.clipboard.copyBuffer = buffer;
        this.paste();
      });
    }
  }

  handleDownload() {
    try {
      const saveLink = document.createElement('a');
      document.body.appendChild(saveLink);

      const {samples, sampleRate} = this.copyCurrentBuffer();
      const wavBuffer = WavEncoder.encode.sync({
        sampleRate: sampleRate,
        channelData: [samples]
      });
      const content = new Blob([wavBuffer], {type: 'audio/wav'});

      const filename = `${this.elems.name.value}.wav`;

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
    } catch (e) {
      console.log(e);
    }
  }

  renderWaveform() {
    const c = this.elems.waveformContext;
    const levels = this.state.chunkLevels.length;
    c.clearRect(0, 0, c.canvas.width, c.canvas.height);
    const segmentWidth = c.canvas.width / levels;
    const waveHeight = c.canvas.height / 3;
    c.fillStyle = '#333';
    this.state.chunkLevels.forEach((v, i) => {
      c.fillRect(i * segmentWidth, Math.floor(c.canvas.height / 2 - v * waveHeight), segmentWidth, Math.ceil(v * waveHeight * 2));
    });
  }

  displayLength() {
    const {samples, sampleRate} = this.copyCurrentBuffer();
    const sampleCount = samples.length;
    this.elems.length.textContent = (sampleCount / sampleRate).toFixed(2) + 's';
  }

  render() {
    const {effectTypes} = AudioEffects;
    const elems = {};
    this.elems = elems;
    elems.waveform = Elem('canvas', {
      className: 'waveform',
      width: WIDTH,
      height: HEIGHT
    });
    elems.waveformContext = elems.waveform.getContext('2d');
    return elems.wrapper = Elem('div', {
      className: 'sound-editor',
      tabindex: 0
    }, [
      elems.name = Elem('input', {
        className: 'name-input',
        type: 'text',
        value: this.props.name
      }),
      elems.downloadBtn = Elem('button', {
        className: 'download-btn',
        onclick: this.handleDownload
      }, ['download']),
      elems.length = Elem('span', {className: 'sound-length'}),
      elems.preview = Elem('div', {
        className: 'preview',
        style: {
          width: WIDTH + 'px',
          height: HEIGHT + 'px'
        },
        onmousedown: e => {
          if (elems.thatWasAFinger) {
            elems.thatWasAFinger = false;
            return;
          }
          const rect = elems.preview.getBoundingClientRect();
          const initialPosition = (e.clientX - rect.left) / rect.width;
          this.handleUpdateTrim(initialPosition, initialPosition);
          const updatePosition = e => {
            const position = (e.clientX - rect.left) / rect.width;
            if (position < initialPosition) {
              this.state.selectDirection = 'start';
              this.handleUpdateTrim(position, initialPosition);
            } else {
              this.state.selectDirection = 'end';
              this.handleUpdateTrim(initialPosition, position);
            }
          }
          document.addEventListener('mousemove', updatePosition);
          document.addEventListener('mouseup', e => {
            document.removeEventListener('mousemove', updatePosition);
          }, {once: true});
        },
        ontouchstart: e => {
          elems.thatWasAFinger = true;
          const rect = elems.preview.getBoundingClientRect();
          const finger = e.changedTouches[0].identifier;
          const initialPosition = (e.touches[finger].clientX - rect.left) / rect.width;
          this.handleUpdateTrim(initialPosition, initialPosition);
          const updatePosition = e => {
            const position = (e.touches[finger].clientX - rect.left) / rect.width;
            if (position < initialPosition) {
              this.state.selectDirection = 'start';
              this.handleUpdateTrim(position, this.state.trimEnd);
            } else {
              this.state.selectDirection = 'end';
              this.handleUpdateTrim(this.state.trimStart, position);
            }
            e.preventDefault();
          }
          document.addEventListener('touchmove', updatePosition, {passive: false});
          document.addEventListener('touchend', e => {
            document.removeEventListener('touchmove', updatePosition);
          }, {once: true});
        }
      }, [
        elems.waveform,
        elems.playhead = Elem('div', {className: 'playhead'}),
        elems.trim = Elem('div', {className: 'selection-range'})
      ]),
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
          this.handleActivateTrim();
        }],
        ['copy (ctrl + C)', this.handleCopy],
        ['paste (ctrl + V)', this.handlePaste],
        ['---'],
        ['delete (backspace)', this.handleActivateTrim],
        ['select all (ctrl + A)', () => {
          this.handleUpdateTrim(0, 1);
        }],
        ['trim', () => {
          this.handleActivateTrim(true);
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
        ['magic', this.effectFactory(effectTypes.MAGIC)]
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
      }, ['redo (ctrl + Y)'])
    ]);
  }

}

export default SoundEditor;
