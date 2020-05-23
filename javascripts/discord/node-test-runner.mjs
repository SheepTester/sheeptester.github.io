import Discord from 'discord.js'
import main from './anyone-speaks.mjs'

// https://stackoverflow.com/a/5767589
const [token] = process.argv.slice(2)

main(token, Discord)
