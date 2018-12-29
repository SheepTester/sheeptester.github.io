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

const BASE_URL = 'https://sheeptester.github.io'
const customPaths = [
  // eg the scratch-x repos that have pretty cool pages but have a lot of dumb files
  '/scratch-gui/index.html',
  '/scratch-blocks/playgrounds/tests/vertical_playground.html',
  '/blockly/SHEEP/tset.html',
  '/blog/index.html',
  '/blog/ABOUT/index.html',
  '/blog/HELLO-WORLD/index.html',
  '/blog/SECOND-POST/index.html',
  '/blog/SHOWBALL-PROBLEM-JOURNAL/index.html',
  '/blog/images/image09.png',
  '/blog/images/image11.png',
  '/blog/images/image10.png'
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
      const url = tempPath.join('/') + '/' + (line === 'index.html' ? '' : line);
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
      }
      type = type ? ` class="${type}"` : '';
      html += `<a href="${url}"${type}>${line}</a>`;
    }
  });
  await write('./all/index.html', template.replace(/{DATE}/g, new Date().toISOString().slice(0, 10)).replace('{FILES}', html));
  await write('./all/sitemap.txt', htmlURLs.join('\n'));
  console.log('Done!');
})();
