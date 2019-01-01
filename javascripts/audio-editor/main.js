import {handleFileUpload} from './file-uploader.js';

import AudioEngine from './AudioEngine.js';
import SharedAudioContext from './audio/shared-audio-context.js';

import SoundEditor from './sound-editor.js';

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
function randomName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  return `A${'aeiou'.includes(adjective[0]) ? 'n' : ''} ${adjective} sound`;
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
      name: randomName(),
      clipboard: clipboard
    });
    document.body.appendChild(createElement('hr'))
    document.body.appendChild(editor.render());
    editor.renderWaveform();
  });
});
