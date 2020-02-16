// npm run compress

const fs = require('fs');
const path = require('path');
const execFile = require('child_process').execFile;
const pngquant = require('pngquant-bin');

function getFileSize(file) {
  return new Promise((res, rej) => {
    fs.stat(path.resolve(__dirname, file), (err, stats) => {
      if (err) rej(err);
      else res(stats.size);
    });
  });
}

const images = [
  // 'all2.png',
  // 'aplat.png',
  // 'ugwa.png',
  // 'colourpick.png',
  // 'platmakre.png',
  // 'newpenland.png',
  // 'turkeys.png',
  // 'tele.png',
  // 'click.png',
  // 'reds.png',
  // 'color.png',
  // 'connect4.png',
  // 'gunn student simulator.png',
  // 'fgr.png',
  // 'js.png',
  // 'misc.png',
  // 'thingkingland.png',
  // 'particles.png',
  // 'minigames.png',
  // 'helloworlddir.png',
  // 'trumpdays.png',
  // 'audio-editor.png',
  // 'roots.png',
  // 'mems.png',
  // 'sieve.png',
  // 'anima.png',
  // 'sentence.png',
  // 'rightclick.png',
  // 'longtweets.png',
  // 'billy-goat.png',
  // 'carecalc.png',
  // 'fword.png',
  // 'mspaint.png',
  // 'olamreee.png',
  // 'scheme.png',
  // 'cyrillic.png',
  // 'terminal.png',
  // 'penland.png',
  // 'life.png',
  // 'mars.png',
  // 'ovinetopia.png',
  // 'eyo.png',
  // 'die.png',
  // 'drills.png',
  // 'house.png',
  // 'hotel.png',
  // 'charcopy.png',
  // 'combining.png',
  // 'crypto.png',
  // 'htmlifier.png',
  // 'openshit.png',
  // 'smothered.png',
  // 'svgtopng.png',
  // 'text-save.png',
  // 'tile-editor.png',
  // 'weird-flex-but-ok.png',
  // 'yesnt.png',
  // 'pistole.png',
  // 'pfpfpf.png',
  // 'roshambo.png',
  // 'userscripts.png',
  // 'attitude.png',
  // 'eyangicques.png',
  // 'ugwisha.png',
  // 'elimination.png',
  'khwvahy.png',
  'flappy.png',
].map(img => path.resolve(__dirname, img));

console.log('Starting...');
execFile(pngquant, ['--quality=60-80', '--ext', '-smaller.png', '--force', ...images], err => {
  if (err) console.log(err);
  else console.log('Done. Comparing fat vs compressed...');
  Promise.all(images.map(img => Promise.all([
    getFileSize(img),
    getFileSize(img.replace('.png', '-smaller.png'))
  ]).then(([old, compressed]) =>
      Math.round((old - compressed) / old * 100).toString().padStart(4, ' ') + '% ' + img)))
    .then(reductions => {
      console.log('Reductions:\n' + reductions.join('\n'));
    });
});
