import * as esbuild from 'esbuild'
import { writeFile } from 'node:fs/promises'

const result1 = await esbuild.build({
  entryPoints: ['all/sheep3/sheep3.ts'],
  bundle: true,
  format: 'iife',
  write: false,
  minify: true,
  outdir: 'out'
})
const output1 = Object.fromEntries(
  result1.outputFiles.map(({ path, text }) => [
    path.split('/').at(-1) ?? '',
    text
  ])
)
console.error(Object.keys(output1))

const result2 = await esbuild.build({
  stdin: {
    contents: output1['sheep3.js']
  },
  define: {
    CSS: JSON.stringify(output1['sheep3.css'].trim())
  },
  banner: {
    js: '// Source code at /all/sheep3/sheep3.ts'
  },
  format: 'iife',
  write: false,
  minify: true,
  outdir: 'out'
})
const output2 = Object.fromEntries(
  result2.outputFiles.map(({ path, contents }) => [
    path.split('/').at(-1) ?? '',
    contents
  ])
)
console.error(Object.keys(output2))

await writeFile('./sheep3.js', output2['stdin.js'])
