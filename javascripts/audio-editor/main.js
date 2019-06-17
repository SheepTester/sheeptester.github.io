import {handleFileUpload} from './file-uploader.js';

import AudioEngine from './AudioEngine.js';
import SharedAudioContext from './audio/shared-audio-context.js';

import SoundEditor from './sound-editor.js';

import AudioRecorder from './audio/audio-recorder.js';

const adjectives = [
  'new',
  'pretty cool',
  'interesting',
  'awesome',
  'empty',
  'fascinating',
  'untitled',
  'nameless',
  'loud',
  'quiet',
  'intriguing',
  'okay',
  'audible'
];
function randomName(noun) {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  return `A${'aeiou'.includes(adjective[0]) ? 'n' : ''} ${adjective} ${noun}`;
}

const clipboard = {copyBuffer: null};
function addSound(name, sampleRate, samples) {
  const editor = new SoundEditor({sampleRate, samples, name, clipboard});
  document.body.appendChild(Elem('hr'))
  document.body.appendChild(editor.render());
  editor.renderWaveform();
  editor.displayLength();
}

document.addEventListener('DOMContentLoaded', e => {
  const audioContext = new SharedAudioContext();
  document.getElementById('add-sound').addEventListener('change', e => {
    // https://github.com/LLK/scratch-gui/blob/develop/src/containers/sound-tab.jsx#L122

    handleFileUpload(e.target, (buffer, fileType, fileName) => {
      const audioBuffer = new AudioEngine(audioContext)._decodeSound({data: {buffer}});
      audioBuffer.then(audioBuffer => {
        addSound(fileName, audioBuffer.sampleRate, audioBuffer.getChannelData(0));
      });
    });
  });
  document.getElementById('new-sound').addEventListener('click', e => {
    addSound(randomName('sound'), 48000, new Float32Array([0]));
  });
  const recordSound = document.getElementById('record-sound');
  const stopRecord = document.getElementById('stop-record');
  const recordingDisplay = document.getElementById('record-display');
  recordingDisplay.style.display = 'none';
  let audioRecorder = null, recordingStartTime;
  function levelUpdate(level) {
    recordingDisplay.style.setProperty('--level', level * 100 + '%');
    recordingDisplay.dataset.time = (Date.now() - recordingStartTime) / 1000 + 's';
  }
  recordSound.addEventListener('click', e => {
    if (audioRecorder) return;
    recordSound.disabled = true;
    stopRecord.disabled = false;
    audioRecorder = new AudioRecorder();
    audioRecorder.startListening(() => {
      recordingDisplay.style.display = null;
      recordingStartTime = Date.now();
      audioRecorder.startRecording();
    }, levelUpdate, () => {
      alert('recording problem');
    });
  });
  stopRecord.addEventListener('click', e => {
    if (!audioRecorder) return;
    recordSound.disabled = false;
    stopRecord.disabled = true;
    const {samples, sampleRate} = audioRecorder.stop();
    addSound(randomName('recording'), sampleRate, samples);
    audioRecorder.dispose();
    audioRecorder = null;
    recordingDisplay.style.display = 'none';
  });
});
