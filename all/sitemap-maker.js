const fs = require('fs');
const fetch = require('node-fetch');

const urlifier = file =>
  'https://sheeptester.github.io/'
    + (file.repository.name === 'sheeptester.github.io' ? '' : file.repository.name + '/')
    + (file.name === 'index.html' ? file.path.slice(0, -10) : file.path);

const query = 'https://api.github.com/search/code?q=extension:.html+user:SheepTester&per_page=100';

fetch(query).then(res => res.json()).then(({total_count, items}) => {
  console.log('Initial request done!');
  const links = items.map(urlifier);
  let promises = [];
  for (let i = 1, pages = Math.ceil(total_count / 100); i < pages; i++)
    promises.push(fetch(query + '&page=' + (i + 1)).then(res => (console.log('Request ' + i + ' done!'), res.json())));
  Promise.all(promises).then(itemses => {
    itemses.forEach(results => links.push(...results.items.map(urlifier)));
    fs.writeFile('./all/sitemap.txt', links.join('\n'), err => {
      console.log(err || 'All done!');
    });
  });
});
