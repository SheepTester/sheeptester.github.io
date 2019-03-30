// execute at /sheeptester.github.io
// node all/makermakermaker.js

function write(file, contents) {
  return new Promise((res, rej) => {
    fs.writeFile(path.resolve(siteRoot, file), contents, 'utf8', err => err ? rej(err) : res());
  });
}

const fs = require('fs');
const path = require('path');

const siteRoot = path.resolve(__dirname, '..');

// based on https://stackoverflow.com/a/20525865
const blackList = [
  './all/more-everything.json',
  '../site/sheep.css',
  '../site/sheep.js',
  '../site/sheep3.css',
  '../site/sheep3.js',
  '../site/gunn-student-sim/the-actual-unminified-encoder-that-you-wont-be-able-to-see-muahahaha.js'
];
function getFiles(dir, files = []){
    fs.readdirSync(path.resolve(siteRoot, dir)).forEach(file => {
      const name = dir + '/' + file;
      if (fs.statSync(path.resolve(siteRoot, name)).isDirectory()) {
        if (file !== '.git' && file !== 'node_modules') getFiles(name, files);
      }
      else if (file !== '.gitignore' && !blackList.includes(name)) files.push(name);
    });
    return files;
}

write('./all/more-everything.json', JSON.stringify([
  ...getFiles('.').map(file => file.slice(1)),
  ...getFiles('../site').map(file => file.slice(7))
]));
