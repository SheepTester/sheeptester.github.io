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
function addSound(name, samples, sampleRate) {
  const editor = new SoundEditor({sampleRate, samples, name, clipboard, addSound});
  document.body.appendChild(editor.render());
  editor.handleUpdateZoom();
  editor.displayLength();
}

document.addEventListener('DOMContentLoaded', e => {
  const audioContext = new SharedAudioContext();
  document.getElementById('add-sound').addEventListener('change', e => {
    // https://github.com/LLK/scratch-gui/blob/develop/src/containers/sound-tab.jsx#L122

    handleFileUpload(e.target, (buffer, fileType, fileName) => {
      const audioBuffer = new AudioEngine(audioContext)._decodeSound({data: {buffer}});
      audioBuffer.then(audioBuffer => {
        addSound(fileName, audioBuffer.getChannelData(0), audioBuffer.sampleRate);
      });
    });
  });
  document.getElementById('new-sound').addEventListener('click', e => {
    addSound(randomName('sound'), new Float32Array(1), 48000);
  });
  const recordSound = document.getElementById('record-sound');
  const recordDesktop = document.getElementById('record-desktop');
  const stopRecord = document.getElementById('stop-record');
  const recordingDisplay = document.getElementById('record-display');
  recordingDisplay.style.display = 'none';
  let audioRecorder = null, recordingStartTime;
  function levelUpdate(level) {
    recordingDisplay.style.setProperty('--level', level * 100 + '%');
    recordingDisplay.dataset.time = (Date.now() - recordingStartTime) / 1000 + 's';
  }
  function startRecording(recorder) {
    recordSound.disabled = true;
    recordDesktop.disabled = true;
    stopRecord.disabled = false;

    audioRecorder = recorder;
    audioRecorder.startListening(() => {
      recordingDisplay.style.display = null;
      recordingStartTime = Date.now();
      audioRecorder.startRecording();
    }, levelUpdate, err => {
      console.error(err);
      try {
        stopRecording();
      } catch (err) {
        console.error(err);
      }
      alert('There was a problem with getting access to the recording source.');
    });
  }
  function stopRecording() {
    recordSound.disabled = false;
    recordDesktop.disabled = false;
    stopRecord.disabled = true;

    audioRecorder.dispose();
    audioRecorder = null;
    recordingDisplay.style.display = 'none';
  }
  recordSound.addEventListener('click', e => {
    if (audioRecorder) return;
    startRecording(new AudioRecorder());
  });
  recordDesktop.addEventListener('click', e => {
    if (audioRecorder) return;
    startRecording(new AudioRecorder('screen'));
  });
  stopRecord.addEventListener('click', e => {
    if (!audioRecorder) return;
    const {samples, sampleRate} = audioRecorder.stop();
    addSound(randomName('recording'), samples, sampleRate);
    stopRecording();
  });
  const desktopAudioWrapper = document.getElementById('desktop-audio');
  document.getElementById('open-desktop-audio').addEventListener('click', e => {
    desktopAudioWrapper.classList.toggle('hidden');
  });
});
