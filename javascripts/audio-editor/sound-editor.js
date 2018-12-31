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
      trimStart: null,
      trimEnd: null
    };
    this.redoStack = [];
    this.undoStack = [];
    this.audioBufferPlayer = new AudioBufferPlayer(this.props.samples, this.props.sampleRate);
  }

}

export default SoundEditor;
