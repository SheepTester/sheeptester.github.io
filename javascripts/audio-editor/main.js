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

document.addEventListener('DOMContentLoaded', e => {
  const audioContext = new SharedAudioContext();
  const clipboard = {data: null};
  document.getElementById('add-sound').addEventListener('change', e => {
    // https://github.com/LLK/scratch-gui/blob/develop/src/containers/sound-tab.jsx#L122

    handleFileUpload(e.target, (buffer, fileType, fileName) => {
      const audioBuffer = new AudioEngine(audioContext)._decodeSound({data: {buffer}});
      audioBuffer.then(audioBuffer => {
        const editor = new SoundEditor({
          sampleRate: audioBuffer.sampleRate,
          samples: audioBuffer.getChannelData(0),
          name: fileName,
          clipboard: clipboard
        });
        document.body.appendChild(createElement('hr'))
        document.body.appendChild(editor.render());
        editor.renderWaveform();
      });
    });
  });
  document.getElementById('new-sound').addEventListener('click', e => {
    const editor = new SoundEditor({
      sampleRate: 48000,
      samples: new Float32Array([0]),
      name: randomName('sound'),
      clipboard: clipboard
    });
    document.body.appendChild(createElement('hr'))
    document.body.appendChild(editor.render());
    editor.renderWaveform();
  });
  const recordSound = document.getElementById('record-sound');
  const stopRecord = document.getElementById('stop-record');
  const recordingDisplay = document.getElementById('record-display');
  recordingDisplay.style.display = 'none';
  let audioRecorder = null;
  function levelUpdate(level) {
    recordingDisplay.style.setProperty('--level', level * 100 + '%');
  }
  recordSound.addEventListener('click', e => {
    if (audioRecorder) return;
    recordSound.disabled = true;
    stopRecord.disabled = false;
    audioRecorder = new AudioRecorder();
    audioRecorder.startListening(() => {
      recordingDisplay.style.display = null;
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
    const editor = new SoundEditor({
      sampleRate: sampleRate,
      samples: samples,
      name: randomName('recording'),
      clipboard: clipboard
    });
    document.body.appendChild(createElement('hr'))
    document.body.appendChild(editor.render());
    editor.renderWaveform();
    audioRecorder.dispose();
    audioRecorder = null;
    recordingDisplay.style.display = 'none';
  });
});
