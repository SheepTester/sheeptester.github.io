export const domain: string
export const ghUser: string

/**
 * Assumes `master` is default branch
 * NOTE: This means that you must explicitly list `main`
 */
export const ghPagesRepos: string[]

export const jekyllRepos: string[]

/**
 * Maps a repository name and branch (default: `master`) to a string to prefix
 * before HTML file paths in the repo. `null` if this mapping is not feasible.
 *
 * These repositories build and deploy to GitHub Pages directly from GitHub
 * Actions. By my own convention, the list of all files deployed is stored in
 * sitemap.txt. However, we still lose a 1-to-1 connection between output and
 * source file.
 */
export const actionsRepos: Record<string, string | null>

export const ignore: string[]

/** Read-only repos (used by img-preview) */
export const archived: string[]
