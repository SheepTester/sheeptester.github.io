const fs = require('fs');
const nodePath = require('path');
const {exec} = require('child_process');

// https://stackoverflow.com/a/29655902
function runCommand(command) {
  return new Promise((res, rej) => {
    exec(command, (err, stdout, stderr) => {
      if (err !== null) rej(err);
      else if (typeof stderr !== 'string') rej(stderr);
      else res(stdout);
    });
  });
}

function write(file, contents) {
  return new Promise((res, rej) => {
    fs.writeFile(file, contents, 'utf8', err => err ? rej(err) : res());
  });
}

function getContentsOfDir(directory) {
  return new Promise((res, rej) => {
    fs.readdir(directory, (err, files) => err ? rej(err) : res(files));
  });
}

function getStats(path) {
  return new Promise((res, rej) => {
    fs.stat(path, (err, stats) => err ? rej(err) : res(stats));
  });
}

// the /sheeptester.github.io folder
const siteRoot = nodePath.resolve(__dirname, '../');

(async () => {
  // ls-tree https://stackoverflow.com/a/15606995
  // NOTE: assumes all repos use master branch; this is shady
  // --git-dir https://stackoverflow.com/a/3769169
  // -z https://stackoverflow.com/a/40721503

  console.log('getting sheeptester.github.io files');
  const paths = (await runCommand(`git --git-dir ${siteRoot}/.git ls-tree -r -z master --name-only`))
    .split('\0').slice(0, -1).map(f => `/${f}`);

  console.log('getting site files');
  for (const item of await getContentsOfDir(nodePath.resolve(siteRoot, '../site/'))) {
    const path = nodePath.resolve(siteRoot, '../site/', item);
    if ((await getStats(path)).isDirectory()) {
      paths.push(...(await runCommand(`git --git-dir ${path}/.git ls-tree -r -z master --name-only`))
        .split('\0').slice(0, -1).map(f => `/${item}/${f}`));
    }
  }

  console.log('writing into more-everything.json');
  await write(nodePath.resolve(__dirname, './more-everything.json'), JSON.stringify(paths));

  console.log('done!');
})()
  .catch(err => {
    console.log(err);
    console.log('oops!');
  });
