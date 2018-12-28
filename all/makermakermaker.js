// execute at /sheeptester.github.io
// node all/makermakermaker.js

function write(file, contents) {
  return new Promise((res, rej) => {
    fs.writeFile(file, contents, 'utf8', err => err ? rej(err) : res());
  });
}

const fs = require('fs');

// based on https://stackoverflow.com/a/20525865
function getFiles(dir, files = []){
    fs.readdirSync(dir).forEach(file => {
      const name = dir + '/' + file;
      if (fs.statSync(name).isDirectory()) {
        if (file !== '.git' && file !== 'node_modules') getFiles(name, files);
      }
      else if (file !== '.gitignore' && name !== './all/more-everything.json') files.push(name);
    });
    return files;
}

write('./all/more-everything.json', JSON.stringify([
  ...getFiles('.').map(file => file.slice(1)),
  ...getFiles('../site').map(file => file.slice(7))
]));
