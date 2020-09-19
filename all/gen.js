const fs = require('fs');
const path = require('path');

const siteRoot = path.resolve(__dirname, '..');

function read(file) {
  return new Promise((res, rej) => {
    fs.readFile(path.resolve(siteRoot, file), 'utf8', (err, data) => err ? rej(err) : res(data));
  });
}
function write(file, contents) {
  return new Promise((res, rej) => {
    fs.writeFile(path.resolve(siteRoot, file), contents, 'utf8', err => err ? rej(err) : res());
  });
}

const folderSymbol = Symbol('folder');

const BASE_URL = 'https://sheeptester.github.io'
const customPaths = [
  // Manually add paths to the sitemap
];

(async () => {
  console.log('Starting...');
  const paths = JSON.parse(await read('./all/more-everything.json')); // this file is big
  paths.push(...customPaths);
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
  paths.forEach(path => objectception(pathObj, path.split('/').slice(1)));
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
  splatception(pathObj);
  await write('./all/everything.txt', pathLines.join('\n'));
  const template = await read('./all/template-all.html');
  let html = '';
  const tempPath = [''];
  const htmlURLs = [];
  pathLines.forEach(line => {
    if (line[0] === '>') {
      html += `<div class="dir"><div class="head" tabindex="0">${line.slice(1)}</div><div class="body">`;
      tempPath.push(line.slice(1));
    } else if (line === '<') {
      html += `</div></div>`;
      tempPath.pop();
    } else {
      const extension = line.slice(line.lastIndexOf('.') + 1);
      const url = tempPath.join('/') + '/' + (line === 'index.html' || line === 'index.md' ? '' : line);
      let type;
      switch (extension) {
        case 'html':
          type = 'html';
          if (line === 'index.html') type += ' index';
          htmlURLs.push(BASE_URL + url);
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
        case 'md':
          if (line === 'index.md') {
            type = 'index';
            htmlURLs.push(BASE_URL + url);
          }
          break;
      }
      type = type ? ` class="${type}"` : '';
      html += `<a href="${url}"${type}>${line}</a>`;
    }
  });
  await write('./all/index.html', template.replace(/{DATE}/g, new Date().toISOString().slice(0, 10)).replace('{FILES}', html));
  await write('./all/sitemap.txt', htmlURLs.join('\n'));
  console.log('Done!');
})();
