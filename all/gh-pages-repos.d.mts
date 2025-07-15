export const domain: string
export const ghUser: string

/**
 * Assumes `master` is default branch
 * NOTE: This means that you must explicitly list `main`
 */
export const ghPagesRepos: string[]

export const jekyllRepos: string[]

/**
 * These repositories build and deploy to GitHub Pages directly from GitHub
 * Actions. By my own convention, the list of all files deployed is stored in
 * sitemap.txt. However, we still lose a 1-to-1 connection between output and
 * source file.
 */
export const actionsRepos: string[]

export const ignore: string[]
