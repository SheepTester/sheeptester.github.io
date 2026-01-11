export const domain = 'sheeptester.github.io'
export const ghUser = 'SheepTester'

export type RepoType =
  | {
      /**
       * A typical static site. It can generally be assumed there's a 1-to-1
       * source-to-site correspondence for files, but not for all files: it
       * seems GitHub Pages will not preserve some files by default, like files
       * named LICENSE or README.md.
       */
      type: 'gh-pages'
    }
  | {
      /**
       * Uses GitHub Pages' built-in support for Jekyll, which means I have
       * little control over what other files I want to include.
       * `/<repo-name>/sitemap.xml` is expected to exist.
       */
      type: 'jekyll'
    }
  | {
      /**
       * These repositories build and deploy to GitHub Pages directly from
       * GitHub Actions. By my own convention, the list of all files deployed is
       * available at `/<repo-name>/sitemap.txt`.
       *
       * However, we still lose a guaranteed 1-to-1 connection between output
       * and source file.
       */
      type: 'actions'
      /**
       * Prefix added before HTML file paths from the sitemap, used to
       * optimistically map from a sitemap path to a source file in the repo.
       */
      prefix: string
    }

export type Repo = {
  name: string
  description?: string
  /** Defaults to `master` */
  branch?: string
  /** Defaults to `gh-pages` */
  type?: RepoType
}

export const repos: Repo[] = [
  { name: 'alt-schedule-parser-tester' },
  { name: 'ascended-cat' },
  { name: 'assembly' },
  { name: 'blockly' },
  { name: 'calculator' },
  { name: 'colour' },
  { name: 'dating-sim' },
  { name: 'dulcinea', branch: 'main' },
  { name: 'dumb-multiplayer-server' },
  { name: 'evo' },
  { name: 'eyo-dictionary' },
  { name: 'flex10-protect' },
  { name: 'fun-gunn-run' },
  { name: 'gamepro5.github.io' },
  { name: 'gunn-map' },
  { name: 'gunn-student-sim' },
  { name: 'happynumbers' },
  { name: 'HEALTH-AMONG-US', branch: 'gh-pages' },
  { name: 'htmlblocks' },
  { name: 'htmlifier' },
  { name: 'intuitive-gunn-website' },
  { name: 'mars' },
  { name: 'offline-ucsd-map', branch: 'gh-pages' },
  { name: 'olamreee' },
  { name: 'ovinetopia' },
  { name: 'platformre' },
  { name: 'reiglutopia' },
  { name: 'roots' },
  { name: 'scratch-blocks', branch: 'gh-pages' },
  { name: 'scratch-gui', branch: 'gh-pages' },
  { name: 'scratch-vm', branch: 'gh-pages' },
  { name: 'sheep-sim' },
  { name: 'skejl' },
  { name: 'text-save' },
  { name: 'theflat' },
  { name: 'themes' },
  { name: 'thingkingland' },
  { name: 'thirty-eight' },
  { name: 'toastia' },
  { name: 'toki-pona' },
  { name: 'unclear-target-w-very-confusing-critique' },
  { name: 'uxdy', branch: 'gh-pages' },
  { name: 'word-prediction' },
  { name: 'words-go-here' },
  { name: 'yesnt' },
  { name: 'blog', type: { type: 'jekyll' } },
  { name: 'cse15l-lab-reports', branch: 'main', type: { type: 'jekyll' } },
  { name: 'longer-tweets', type: { type: 'jekyll' } },
  {
    name: 'ucsd-sunset',
    branch: 'main',
    type: { type: 'actions', prefix: 'static/' }
  },
  {
    name: 'guestbook',
    branch: 'main',
    type: { type: 'actions', prefix: 'UNUSED' }
  },
  {
    name: 'doufu',
    branch: 'main',
    type: { type: 'actions', prefix: 'static/' }
  },
  { name: 'qr', branch: 'main', type: { type: 'actions', prefix: 'static/' } },
  {
    name: 'cse272-project',
    branch: 'main',
    type: { type: 'actions', prefix: 'public/' }
  },
  { name: 'hello-world', type: { type: 'actions', prefix: '' } },
  {
    name: 'ucsd-classrooms',
    branch: 'main',
    type: { type: 'actions', prefix: 'static/' }
  }
]

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
