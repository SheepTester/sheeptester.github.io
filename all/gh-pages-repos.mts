export const domain = 'sheeptester.github.io'
export const ghUser = 'SheepTester'

/**
 * Assumes `master` is default branch
 * NOTE: This means that you must explicitly list `main`
 */
export const ghPagesRepos = [
  'alt-schedule-parser-tester',
  'ascended-cat',
  'assembly',
  'blockly',
  'calculator',
  // 'chaotic-cube',
  'colour',
  'dating-sim',
  'dulcinea#main',
  'dumb-multiplayer-server',
  'evo',
  'eyo-dictionary',
  'flex10-protect',
  'fun-gunn-run',
  'gamepro5.github.io',
  'gunn-map',
  'gunn-student-sim',
  'happynumbers',
  'HEALTH-AMONG-US#gh-pages',
  'htmlblocks',
  'htmlifier',
  'intuitive-gunn-website',
  'mars',
  'offline-ucsd-map#gh-pages',
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
  'uxdy#gh-pages',
  'word-prediction',
  'words-go-here',
  'yesnt'
]

export const jekyllRepos = ['blog', 'cse15l-lab-reports#main', 'longer-tweets']

/**
 * Maps a repository name and branch (default: `master`) to a string to prefix
 * before HTML file paths in the repo. `null` if this mapping is not feasible.
 *
 * These repositories build and deploy to GitHub Pages directly from GitHub
 * Actions. By my own convention, the list of all files deployed is stored in
 * sitemap.txt. However, we still lose a 1-to-1 connection between output and
 * source file.
 */
export const actionsRepos: Record<string, string | null> = {
  'ucsd-sunset#main': 'static/',
  'guestbook#main': null,
  'doufu#main': 'static/',
  'qr#main': 'static/',
  'cse272-project#main': 'public/',
  // Assumes the hello-world markdown pages won't reference sheepX.js
  'hello-world': '',
  'ucsd-classrooms#main': 'static/'
}

export const ignore = [
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
  '/scratch-vm/media/'
]

/** Read-only repos (used by img-preview) */
export const archived = ['thingkingland', 'ovinetopia']
