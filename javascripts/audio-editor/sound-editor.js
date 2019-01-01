// reconstruction of https://github.com/LLK/scratch-gui/blob/develop/src/containers/sound-editor.jsx

import {computeChunkedRMS} from './audio/audio-util.js';
import AudioEffects from './audio/audio-effects.js';
import AudioBufferPlayer from './audio/audio-buffer-player.js';

const UNDO_STACK_SIZE = 99;

class SoundEditor {

  constructor(props) {
    this.props = props;
    this.state = {
      chunkLevels: computeChunkedRMS(this.props.samples),
      playhead: null, // null is not playing, [0 -> 1] is playing percent
      selectionStart: 0,
      selectionEnd: 1
    };
    this.redoStack = [];
    this.undoStack = [];
    this.audioBufferPlayer = new AudioBufferPlayer(this.props.samples, this.props.sampleRate);
  }

  copyCurrentBuffer() {
    // Cannot reliably use props.samples because it gets detached by Firefox
    return {
      samples: this.audioBufferPlayer.buffer.getChannelData(0),
      sampleRate: this.audioBufferPlayer.buffer.sampleRate
    };
  }

  resetState (samples, sampleRate) {
    this.audioBufferPlayer.stop();
    this.audioBufferPlayer = new AudioBufferPlayer(samples, sampleRate);
    this.state = {
      chunkLevels: computeChunkedRMS(samples),
      playhead: null,
      selectionStart: this.state.selectionStart,
      selectionEnd: this.state.selectionEnd
    };
  }

  submitNewSamples(samples, sampleRate, skipUndo) {
    if (!skipUndo) {
      this.redoStack = [];
      if (this.undoStack.length >= UNDO_STACK_SIZE) {
        this.undoStack.shift(); // Drop the first element off the array
      }
      this.undoStack.push(this.copyCurrentBuffer());
    }

    this.resetState(samples, sampleRate);
  }

  play() {
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
    this.elems.playhead.style.display = null;
    this.state.playhead = null;
  }

  undo() {
    this.redoStack.push(this.copyCurrentBuffer());
    const {samples, sampleRate} = this.undoStack.pop();
    if (samples) {
      this.submitNewSamples(samples, sampleRate, true);
    }
  }

  redo() {
    const {samples, sampleRate} = this.redoStack.pop();
    if (samples) {
      this.undoStack.push(this.copyCurrentBuffer());
      this.submitNewSamples(samples, sampleRate, true);
    }
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

  trim() {
    if (this.state.selectionStart !== this.state.selectionEnd) {
      const {samples, sampleRate} = this.copyCurrentBuffer();
      const sampleCount = samples.length;
      const startIndex = Math.floor(this.state.selectionStart * sampleCount);
      const endIndex = Math.floor(this.state.selectionEnd * sampleCount);
      const clippedSamples = samples.slice(startIndex, endIndex);
      this.updateSelectionStart(0);
      this.updateSelectionEnd(1);
      this.submitNewSamples(clippedSamples, sampleRate);
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
      const totalLength = leftSample.length + insertDataLength + rightSample.length;
      const newSample = new Float32Array(totalLength);
      newSample.set(leftSample);
      if (insertData) newSample.set(insertData, leftSample.length);
      newSample.set(rightSample, leftSample.length + insertDataLength);
      const newSelectionRange = startIndex / totalLength;
      this.state.selectionEnd = 1;
      this.updateSelectionStart(newSelectionRange);
      if (insertData) {
        this.updateSelectionEnd(1 - (sampleCount - endIndex) / totalLength);
      } else {
        this.updateSelectionEnd(newSelectionRange);
      }
      this.submitNewSamples(newSample, sampleRate);
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

  render() {
    const elems = {};
    this.elems = elems;
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
        elems.preview = createElement('div', {
          classes: 'preview',
          children: [
            elems.playhead = createElement('div', { classes: 'playhead' }),
            elems.selection = createElement('div', { classes: 'selection-range' })
          ],
          listeners: {
            mousedown: e => {
              const rect = elems.preview.getBoundingClientRect();
              const initialPosition = (e.clientX - rect.left) / rect.width;
              this.state.selectionEnd = 1;
              this.updateSelectionStart(initialPosition);
              this.updateSelectionEnd(initialPosition);
              const self = this;
              function updatePosition(e) {
                const position = (e.clientX - rect.left) / rect.width;
                if (position < initialPosition) self.updateSelectionStart(position);
                else self.updateSelectionEnd(position);
              }
              document.addEventListener('mousemove', updatePosition);
              document.addEventListener('mouseup', e => {
                document.removeEventListener('mousemove', updatePosition);
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
          listeners: {click: this.stopPlaying.bind(this)}
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
              this.updateSelectionStart(0);
              this.updateSelectionEnd(1);
              break;
            case 'trim':
              this.trim();
              break;
          }
        }),
        elems.effects = Select('Effects', ['reverse', '---', 'slower', 'faster', 'softer', 'louder', '---', 'robot', 'echo'], option => {
          console.log(option);
        }),
        elems.undoBtn = createElement('button', {
          classes: 'undo-btn',
          children: ['undo'],
          listeners: {click: this.undo.bind(this)}
        }),
        elems.redoBtn = createElement('button', {
          classes: 'redo-btn',
          children: ['redo'],
          listeners: {click: this.redo.bind(this)}
        })
      ]
    });
  }

}

export default SoundEditor;
