import Discord from 'discord.js'
import main from './add-roles-to-all.mjs'

// https://stackoverflow.com/a/5767589
const [token] = process.argv.slice(2)

main(token, Discord)
