import Discord from 'discord.js'
import { promises as fs } from 'fs'

// https://stackoverflow.com/a/5767589
const [script] = process.argv.slice(2)

Promise.all([
  import(script),
  fs.readFile(new URL('./token.json', import.meta.url), 'utf8')
    .then(file => JSON.parse(file))
]).then(([{ default: main }, { token }]) => {
  main(token, Discord)
})
