// reconstruction of https://github.com/LLK/scratch-gui/blob/develop/src/containers/sound-editor.jsx

import WavEncoder from './wav-encoder/index.js';

import {computeChunkedRMS} from './audio/audio-util.js';
import AudioEffects from './audio/audio-effects.js';
import AudioBufferPlayer from './audio/audio-buffer-player.js';

import SharedAudioContext from './audio/shared-audio-context.js';

const UNDO_STACK_SIZE = 99;

const WIDTH = 600;
const HEIGHT = 100;

class SoundEditor {

  constructor(props) {
    this.props = props;
    this.state = {
      chunkLevels: computeChunkedRMS(this.props.samples),
      playhead: null, // null is not playing, [0 -> 1] is playing percent
      selectionStart: 0,
      selectionEnd: 0,
      mainSelection: 'end'
    };
    this.redoStack = [];
    this.undoStack = [];
    this.audioBufferPlayer = new AudioBufferPlayer(this.props.samples, this.props.sampleRate);
    this.audioContext = new SharedAudioContext();
  }

  copyCurrentBuffer() {
    // Cannot reliably use props.samples because it gets detached by Firefox
    return {
      samples: this.audioBufferPlayer.buffer.getChannelData(0),
      sampleRate: this.audioBufferPlayer.buffer.sampleRate
    };
  }

  getHistoricalState() {
    const {samples, sampleRate} = this.copyCurrentBuffer();
    return {
      samples: samples,
      sampleRate: sampleRate,
      selectionStart: this.state.selectionStart,
      selectionEnd: this.state.selectionEnd,
      mainSelection: this.state.mainSelection
    };
  }

  resetState (samples, sampleRate) {
    this.audioBufferPlayer.stop();
    this.audioBufferPlayer = new AudioBufferPlayer(samples, sampleRate);
    this.state = {
      chunkLevels: computeChunkedRMS(samples),
      playhead: null,
      selectionStart: this.state.selectionStart,
      selectionEnd: this.state.selectionEnd,
      mainSelection: this.state.mainSelection
    };
    this.renderWaveform();
  }

  submitNewSamples(samples, sampleRate, skipUndo) {
    if (!skipUndo) {
      if (this.redoStack.length) this.elems.redoBtn.disabled = true;
      if (!this.undoStack.length) this.elems.undoBtn.disabled = false;
      this.redoStack = [];
      if (this.undoStack.length >= UNDO_STACK_SIZE) {
        this.undoStack.shift(); // Drop the first element off the array
      }
      this.undoStack.push(this.getHistoricalState());
    }

    this.resetState(samples, sampleRate);
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

  play() {
    this.elems.playBtn.disabled = true;
    this.elems.stopBtn.disabled = false;
    this.elems.playhead.style.display = 'block';
    this.audioBufferPlayer.play(
      this.state.selectionStart || 0,
      this.state.selectionStart === this.state.selectionEnd ? 1 : this.state.selectionEnd || 1,
      this.updatePlayhead.bind(this),
      this.stoppedPlaying.bind(this)
    );
  }

  stopPlaying() {
    this.audioBufferPlayer.stop();
    this.stoppedPlaying();
  }

  updatePlayhead(playhead) {
    this.elems.playhead.style.left = playhead * 100 + '%';
    this.state.playhead = playhead;
  }

  stoppedPlaying() {
    this.elems.playBtn.disabled = false;
    this.elems.stopBtn.disabled = true;
    this.elems.playhead.style.display = null;
    this.state.playhead = null;
  }

  undo() {
    if (!this.redoStack.length) this.elems.redoBtn.disabled = false;
    this.redoStack.push(this.getHistoricalState());
    const {samples, sampleRate, selectionStart, selectionEnd, mainSelection} = this.undoStack.pop();
    if (samples) {
      this.submitNewSamples(samples, sampleRate, true);
    }
    this.state.selectionStart = 0;
    this.updateSelectionEnd(selectionEnd);
    this.updateSelectionStart(selectionStart);
    this.state.mainSelection = mainSelection;
    if (!this.undoStack.length) this.elems.undoBtn.disabled = true;
  }

  redo() {
    if (!this.undoStack.length) this.elems.undoBtn.disabled = false;
    const {samples, sampleRate, selectionStart, selectionEnd, mainSelection} = this.redoStack.pop();
    if (samples) {
      this.undoStack.push(this.getHistoricalState());
      this.submitNewSamples(samples, sampleRate, true);
    }
    this.state.selectionStart = 0;
    this.updateSelectionEnd(selectionEnd);
    this.updateSelectionStart(selectionStart);
    this.state.mainSelection = mainSelection;
    if (!this.redoStack.length) this.elems.redoBtn.disabled = true;
  }

  updateSelectionStart(selectionStart) {
    if (selectionStart < 0) selectionStart = 0;
    else if (selectionStart > this.state.selectionEnd) selectionStart = this.state.selectionEnd;
    this.elems.selection.style.left = selectionStart * 100 + '%';
    this.state.selectionStart = selectionStart;
  }

  updateSelectionEnd(selectionEnd) {
    if (selectionEnd > 1) selectionEnd = 1;
    else if (selectionEnd < this.state.selectionStart) selectionEnd = this.state.selectionStart;
    this.elems.selection.style.right = (1 - selectionEnd) * 100 + '%';
    this.state.selectionEnd = selectionEnd;
  }

  selectAll() {
    this.updateSelectionStart(0);
    this.updateSelectionEnd(1);
  }

  trim() {
    if (this.state.selectionStart !== this.state.selectionEnd) {
      const {samples, sampleRate} = this.copyCurrentBuffer();
      const sampleCount = samples.length;
      const startIndex = Math.floor(this.state.selectionStart * sampleCount);
      const endIndex = Math.floor(this.state.selectionEnd * sampleCount);
      const clippedSamples = samples.slice(startIndex, endIndex);
      this.submitNewSamples(clippedSamples, sampleRate);
      this.selectAll();
    }
  }

  delete(insertData) {
    if (this.state.selectionStart !== this.state.selectionEnd || insertData) {
      const {samples, sampleRate} = this.copyCurrentBuffer();
      const sampleCount = samples.length;
      const startIndex = Math.floor(this.state.selectionStart * sampleCount);
      const endIndex = Math.floor(this.state.selectionEnd * sampleCount);
      const leftSample = samples.slice(0, startIndex);
      const rightSample = samples.slice(endIndex);
      const insertDataLength = insertData ? insertData.length : 0;
      let totalLength = leftSample.length + insertDataLength + rightSample.length;
      let newSample;
      if (totalLength === 0 && !insertData) { // no empty sounds
        totalLength = 1;
        newSample = new Float32Array(1);
        newSample[0] = samples[0];
      } else {
        newSample = new Float32Array(totalLength);
        newSample.set(leftSample);
        if (insertData) newSample.set(insertData, leftSample.length);
        newSample.set(rightSample, leftSample.length + insertDataLength);
      }
      this.submitNewSamples(newSample, sampleRate);
      const newSelectionRange = startIndex / totalLength;
      this.state.selectionEnd = 1;
      this.updateSelectionStart(newSelectionRange);
      if (insertData) {
        this.updateSelectionEnd(1 - (sampleCount - endIndex) / totalLength);
      } else {
        this.updateSelectionEnd(newSelectionRange);
      }
      return samples.slice(startIndex, endIndex);
    } else {
      return null;
    }
  }

  cut() {
    const data = this.delete();
    if (data) this.props.clipboard.data = data;
  }

  copy() {
    if (this.state.selectionStart !== this.state.selectionEnd) {
      const {samples, sampleRate} = this.copyCurrentBuffer();
      const sampleCount = samples.length;
      const startIndex = Math.floor(this.state.selectionStart * sampleCount);
      const endIndex = Math.floor(this.state.selectionEnd * sampleCount);
      this.props.clipboard.data = samples.slice(startIndex, endIndex);
    }
  }

  paste() {
    this.delete(this.props.clipboard.data);
  }

  effect(name) {
    if (this.state.selectionStart !== this.state.selectionEnd) {
      const {samples, sampleRate} = this.copyCurrentBuffer();
      const sampleCount = samples.length;
      const startIndex = Math.floor(this.state.selectionStart * sampleCount);
      const endIndex = Math.floor(this.state.selectionEnd * sampleCount);
      const leftSample = samples.slice(0, startIndex);
      const rightSample = samples.slice(endIndex);
      const selectedSamples = samples.slice(startIndex, endIndex);
      const audioBuffer = this.audioContext.createBuffer(1, selectedSamples.length, sampleRate);
      const buffer = audioBuffer.getChannelData(0);
      buffer.forEach((_, i) => {
        buffer[i] = selectedSamples[i];
      });
      const effects = new AudioEffects(audioBuffer, name);
      effects.process(({renderedBuffer}) => {
        const samples = renderedBuffer.getChannelData(0);
        // const sampleRate = renderedBuffer.sampleRate; // might be different oof
        const totalLength = leftSample.length + samples.length + rightSample.length;
        const newSample = new Float32Array(totalLength);
        newSample.set(leftSample);
        newSample.set(samples, leftSample.length);
        newSample.set(rightSample, leftSample.length + samples.length);
        this.submitNewSamples(newSample, sampleRate);
        this.state.selectionEnd = 1;
        this.updateSelectionStart(startIndex / totalLength);
        this.updateSelectionEnd(1 - (sampleCount - endIndex) / totalLength);
        this.play();
      });
    }
  }

  effectAll(name) {
    const effects = new AudioEffects(this.audioBufferPlayer.buffer, name);
    effects.process(({renderedBuffer}) => {
      const samples = renderedBuffer.getChannelData(0);
      const sampleRate = renderedBuffer.sampleRate;
      this.submitNewSamples(samples, sampleRate);
      this.play();
    });
  }

  download() {
    try {
      const saveLink = document.createElement('a');
      document.body.appendChild(saveLink);

      const {samples, sampleRate} = this.copyCurrentBuffer();
      const wavBuffer = WavEncoder.encode.sync({
        sampleRate: sampleRate,
        channelData: [samples]
      });
      const content = new Blob([wavBuffer], {type: 'audio/wav'});

      const filename = `${this.props.name}.wav`;

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

  render() {
    const {effectTypes} = AudioEffects;
    const elems = {};
    this.elems = elems;
    elems.waveform = createElement('canvas', {
      classes: 'waveform',
      attributes: {
        width: WIDTH,
        height: HEIGHT
      }
    });
    elems.waveformContext = elems.waveform.getContext('2d');
    return elems.wrapper = createElement('div', {
      classes: 'sound-editor',
      children: [
        elems.name = createElement('input', {
          classes: 'name-input',
          attributes: {
            type: 'text',
            value: this.props.name
          }
        }),
        elems.downloadBtn = createElement('button', {
          classes: 'download-btn',
          children: ['download'],
          listeners: {click: this.download.bind(this)}
        }),
        elems.preview = createElement('div', {
          classes: 'preview',
          children: [
            elems.waveform,
            elems.playhead = createElement('div', { classes: 'playhead' }),
            elems.selection = createElement('div', { classes: 'selection-range' })
          ],
          styles: {
            width: WIDTH + 'px',
            height: HEIGHT + 'px'
          },
          listeners: {
            mousedown: e => {
              if (elems.thatWasAFinger) {
                elems.thatWasAFinger = false;
                return;
              }
              const rect = elems.preview.getBoundingClientRect();
              const initialPosition = (e.clientX - rect.left) / rect.width;
              this.state.selectionEnd = 1;
              this.updateSelectionStart(initialPosition);
              this.updateSelectionEnd(initialPosition);
              const self = this;
              function updatePosition(e) {
                const position = (e.clientX - rect.left) / rect.width;
                if (position < initialPosition) {
                  self.state.mainSelection = 'start';
                  self.updateSelectionStart(position);
                } else {
                  self.state.mainSelection = 'end';
                  self.updateSelectionEnd(position);
                }
              }
              document.addEventListener('mousemove', updatePosition);
              document.addEventListener('mouseup', e => {
                document.removeEventListener('mousemove', updatePosition);
              }, {once: true});
            },
            touchstart: e => {
              elems.thatWasAFinger = true;
              const rect = elems.preview.getBoundingClientRect();
              const finger = e.changedTouches[0].identifier;
              const initialPosition = (e.touches[finger].clientX - rect.left) / rect.width;
              this.state.selectionEnd = 1;
              this.updateSelectionStart(initialPosition);
              this.updateSelectionEnd(initialPosition);
              const self = this;
              function updatePosition(e) {
                const position = (e.touches[finger].clientX - rect.left) / rect.width;
                if (position < initialPosition) {
                  self.state.mainSelection = 'start';
                  self.updateSelectionStart(position);
                } else {
                  self.state.mainSelection = 'end';
                  self.updateSelectionEnd(position);
                }
                e.preventDefault();
              }
              document.addEventListener('touchmove', updatePosition, {passive: false});
              document.addEventListener('touchend', e => {
                document.removeEventListener('touchmove', updatePosition);
              }, {once: true});
            }
          }
        }),
        elems.playBtn = createElement('button', {
          classes: 'play-btn',
          children: ['play'],
          listeners: {click: this.play.bind(this)}
        }),
        elems.stopBtn = createElement('button', {
          classes: 'stop-btn',
          children: ['stop'],
          listeners: {click: this.stopPlaying.bind(this)},
          attributes: {disabled: true}
        }),
        elems.edit = Select('Edit', ['cut', 'copy', 'paste', '---', 'delete', 'select all', 'trim'], option => {
          switch (option) {
            case 'cut':
              this.cut();
              break;
            case 'copy':
              this.copy();
              break;
            case 'paste':
              this.paste();
              break;
            case 'delete':
              this.delete();
              break;
            case 'select all':
              this.selectAll();
              break;
            case 'trim':
              this.trim();
              break;
          }
        }),
        elems.effects = Select('Effects', ['reverse', '---', 'slower', 'faster', 'softer', 'louder', '---', 'robot', 'echo'], option => {
          switch (option) {
            case 'reverse':
              this.effect(effectTypes.REVERSE);
              break;
            case 'slower':
              this.effect(effectTypes.SLOWER);
              break;
            case 'faster':
              this.effect(effectTypes.FASTER);
              break;
            case 'softer':
              this.effect(effectTypes.SOFTER);
              break;
            case 'louder':
              this.effect(effectTypes.LOUDER);
              break;
            case 'robot':
              this.effect(effectTypes.ROBOT);
              break;
            case 'echo':
              this.effect(effectTypes.ECHO);
              break;
          }
        }),
        elems.undoBtn = createElement('button', {
          classes: 'undo-btn',
          children: ['undo'],
          listeners: {click: this.undo.bind(this)},
          attributes: {disabled: true}
        }),
        elems.redoBtn = createElement('button', {
          classes: 'redo-btn',
          children: ['redo'],
          listeners: {click: this.redo.bind(this)},
          attributes: {disabled: true}
        })
      ],
      attributes: {
        tabindex: 0
      },
      listeners: {
        keydown: e => {
          const notShift = !e.shiftKey && !e.altKey;
          const shift = e.shiftKey && !e.altKey;
          let prevent = false;
          if (e.ctrlKey || e.metaKey) {
            switch (e.keyCode) {
              case 65:
                if (notShift) this.selectAll(), prevent = true;
                break;
              case 88:
                if (notShift) this.cut(), prevent = true;
                break;
              case 67:
                if (notShift) this.copy(), prevent = true;
                break;
              case 86:
                if (notShift) this.paste(), prevent = true;
                break;
              case 90:
                if (shift) this.redo(), prevent = true;
                else if (notShift) this.undo(), prevent = true;
                break;
              case 89:
                if (notShift) this.redo(), prevent = true;
                break;
              case 83:
                if (notShift) this.download(), prevent = true;
                break;
              case 37:
                if (shift) {
                  this.updateSelectionStart(0);
                } else if (notShift) {
                  if (this.state.selectionStart === this.state.selectionEnd) {
                    this.updateSelectionStart(0);
                    this.updateSelectionEnd(0);
                  } else {
                    this.updateSelectionEnd(this.state.selectionStart);
                  }
                }
                break;
              case 39:
              if (shift) {
                this.updateSelectionEnd(1);
              } else if (notShift) {
                  if (this.state.selectionStart === this.state.selectionEnd) {
                    this.updateSelectionEnd(1);
                    this.updateSelectionStart(1);
                  } else {
                    this.updateSelectionStart(this.state.selectionEnd);
                  }
                }
                break;
            }
          } else if (e.keyCode === 37) {
            if (shift) {
              if (this.state.mainSelection === 'start') {
                this.updateSelectionStart(this.state.selectionStart - 0.01);
              } else if (this.state.selectionEnd - 0.01 < this.state.selectionStart) {
                const selectionStart = this.state.selectionStart;
                this.updateSelectionStart(this.state.selectionEnd - 0.01);
                this.updateSelectionEnd(selectionStart);
                this.state.mainSelection = 'start';
              } else {
                this.updateSelectionEnd(this.state.selectionEnd - 0.01);
              }
            } else if (notShift) {
              this.updateSelectionStart(this.state.selectionStart - 0.01);
              this.updateSelectionEnd(this.state.selectionEnd - 0.01);
            }
            prevent = true;
          } else if (e.keyCode === 39) {
            if (shift) {
              if (this.state.mainSelection === 'end') {
                this.updateSelectionEnd(this.state.selectionEnd + 0.01);
              } else if (this.state.selectionStart + 0.01 > this.state.selectionEnd) {
                const selectionEnd = this.state.selectionEnd;
                this.updateSelectionEnd(this.state.selectionStart + 0.01);
                this.updateSelectionStart(selectionEnd);
                this.state.mainSelection = 'end';
              } else {
                this.updateSelectionStart(this.state.selectionStart + 0.01);
              }
            } else if (notShift) {
              this.updateSelectionEnd(this.state.selectionEnd + 0.01);
              this.updateSelectionStart(this.state.selectionStart + 0.01);
            }
            prevent = true;
          } else if (notShift && (e.keyCode === 46 || e.keyCode === 8)) {
            this.delete();
            prevent = true;
          } else if (notShift && e.keyCode === 32) {
            if (this.state.playhead === null) this.play();
            else this.stopPlaying();
            prevent = true;
          }
          if (prevent) e.preventDefault();
        }
      }
    });
  }

}

export default SoundEditor;
