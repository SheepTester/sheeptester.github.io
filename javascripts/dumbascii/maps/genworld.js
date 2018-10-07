// node maps/genworld.js 80 100

const fs = require('fs');
const path = require('path');
const simplexNoise = require('./simplex.js');
const [width, height] = process.argv.slice(2).map(Number);

function toChar(double) {
  if (double > 0.7) return '.';
  else if (double > 0.4) return ',';
  else return ';';
}

let table = [];
for (let i = 256; i--;) table[i] = Math.floor(Math.random() * 256);

fs.writeFile(path.join(__dirname, 'world.txt'),
  new Array(height).fill().map((undef, row) =>
      new Array(width).fill().map((undef, col) =>
          toChar(simplexNoise(table, col / 40, row / 20) * 32.5 + 0.5))
        .join(''))
    .join('\n'),
  'utf8', () => {
  console.log('done');
});
