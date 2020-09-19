const domain = 'sheeptester.github.io'
const ghUser = 'SheepTester'

// Assumes `master` is default branch
const ghPagesRepos = [
  'alt-schedule-parser-tester',
  'ascended-cat',
  'blockly',
  'calculator',
  // 'chaotic-cube',
  'colour',
  'dating-sim',
  'evo',
  'eyo-dictionary',
  'flex10-protect',
  'fun-gunn-run',
  'gamepro5.github.io',
  'gunn-map',
  'gunn-student-sim',
  'happynumbers',
  'hello-world',
  'htmlblocks',
  'htmlifier',
  'intuitive-gunn-website',
  'longer-tweets',
  'mars',
  'olamreee',
  'ovinetopia',
  'platformre',
  'reiglutopia',
  'roots',
  'scratch-blocks#gh-pages',
  'scratch-gui#gh-pages',
  // 'scratch-paint#gh-pages',
  'scratch-vm#gh-pages',
  'sheep-sim',
  'skejl',
  'text-save',
  'theflat',
  'themes',
  'thingkingland',
  'thirty-eight',
  'toastia',
  'toki-pona',
  'unclear-target-w-very-confusing-critique',
  'word-prediction',
  'words-go-here',
  'yesnt'
]

const jekyllRepos = [
  'blog'
]

const ignore = [
  '/blockly/',
  '!/blockly/SHEEP/',
  '!/blockly/msg/js/en.js',
  '!/blockly/blockly_compressed.js',
  '!/blockly/blocks_compressed.js',

  '/scratch-blocks/playgrounds/blocks_horizontal/',
  '/scratch-blocks/playgrounds/media/',
  '/scratch-blocks/playgrounds/msg/',
  '/scratch-blocks/playgrounds/node_modules/',
  '/scratch-blocks/playgrounds/tests/',
  '!/scratch-blocks/playgrounds/tests/*.html',
  '/scratch-blocks/playgrounds/*.js',
  '/scratch-blocks/.gitignore',
  '/scratch-blocks/_config.yml',

  '/scratch-gui/16-9/static/assets/',
  '/scratch-gui/16-9/static/blocks-media/',
  '/scratch-gui/static/assets/',
  '/scratch-gui/static/blocks-media/',

  '/scratch-vm/16-9/docs/',
  '/scratch-vm/16-9/media/',
  '/scratch-vm/docs/',
  '/scratch-vm/media/',
]

if (typeof module !== 'undefined' && module) {
  module.exports = { domain, ghUser, ghPagesRepos, jekyllRepos, ignore }
}
