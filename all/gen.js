const fs = require('fs');

function read(file) {
  return new Promise((res, rej) => {
    fs.readFile(file, 'utf8', (err, data) => err ? rej(err) : res(data));
  });
}
function write(file, contents) {
  return new Promise((res, rej) => {
    fs.writeFile(file, contents, 'utf8', err => err ? rej(err) : res());
  });
}

const folderSymbol = Symbol('folder');

(async () => {
  console.log('Reading from JSON');
  const paths = JSON.parse(await read('./all/more-everything.json')); // this file is big
  console.log('ok hmm');
  const pathObj = {};
  function objectception(obj, dirs) {
    if (dirs.length <= 1) {
      if (!obj[folderSymbol]) obj[folderSymbol] = [];
      obj[folderSymbol].push(dirs[0]);
    } else {
      if (!obj[dirs[0]]) obj[dirs[0]] = [];
      objectception(obj[dirs[0]], dirs.slice(1));
    }
  }
  console.log('turning this MASSIVE json file into a recursable object');
  paths.forEach(path => objectception(pathObj, path.split('/').slice(1)));
  console.log('oh my, that was fun');
  const pathLines = [];
  function splatception(obj) {
    const files = obj[folderSymbol];
    delete obj[folderSymbol];
    Object.keys(obj).sort().forEach(dir => {
      pathLines.push('>' + dir);
      splatception(obj[dir]);
      pathLines.push('<');
    });
    if (files) pathLines.push(...files.sort());
  }
  console.log('Splatting the object');
  splatception(pathObj);
  console.log('Writing to text file');
  await write('./all/everything.txt', pathLines.join('\n'));
  console.log('Ok, time to make the actual HTML. Getting template');
  const template = await read('./all/template-all.html');
  let html = '';
  const tempPath = [''];
  console.log('Generating HTML');
  pathLines.forEach(line => {
    if (line[0] === '>') {
      html += `<div class="dir"><div class="head" tabindex="0">${line.slice(1)}</div><div class="body">`;
      tempPath.push(line.slice(1));
    } else if (line === '<') {
      html += `</div></div>`;
      tempPath.pop();
    } else {
      const extension = line.slice(line.lastIndexOf('.') + 1);
      let type;
      switch (extension) {
        case 'html':
          type = 'html';
          if (line === 'index.html') type += ' index';
          break;
        case 'css':
          type = 'css';
          break;
        case 'js':
          type = 'js';
          break;
        case 'svg':
        case 'png':
        case 'gif':
        case 'jpg':
          type = 'img';
          break;
      }
      type = type ? ` class="${type}"` : '';
      html += `<a href="${tempPath.join('/') + line}"${type}>${line}</a>`;
    }
  });
  console.log('Writing to index');
  await write('./all/index.html', template.replace(/{DATE}/g, new Date().toISOString().slice(0, 10)).replace('{FILES}', html));
  console.log('Done!');
})();
