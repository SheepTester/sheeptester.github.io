import Discord from './discord.js'

const { Client } = Discord

const CODE = '```'
const evalRegex = /\beval\s*\(?\s*```(?:js|javascript)?([^]+)```\s*\)?/

function evalOutside (code, methods) {
  return eval(code) // lol
}

export default function main (token) {
  // Create an instance of a Discord client
  const client = new Client()

  client.on('ready', () => {
    console.log('ok')
  })

  client.on('message', async msg => {
    if (msg.mentions.has(client.user)) {
      return msg.reply('do `eval` followed by a code block to have me run arbitrary code! Try running `Object.keys(methods)` to see what extra methods are available for me to run!')
    }
    const match = msg.content.match(evalRegex)
    if (match) {
      try {
        const output = evalOutside(match[1], {
          reply: content => {
            return msg.reply(content)
          },
          guilds: () => {
            return client.guilds.cache.values()
          }
        })
        switch (typeof output) {
          case 'function':
            await msg.reply(`${CODE}js\n${output.toString()}\n${CODE}`)
            break
          case 'symbol':
            await msg.reply(`${CODE}js\nSymbol(${output.description})\n${CODE}`)
            break
          case 'bigint':
            await msg.reply(`${CODE}js\n${output}n\n${CODE}`)
            break
          case 'string':
            await msg.reply(output)
            break
          case 'undefined':
            await msg.react('👍').catch(() => 'whatever')
            break
          default:
            await msg.reply(`${CODE}js\n${JSON.stringify(output, (key, value) => {
              if (typeof value === 'function') {
                return value.toString()
              } else if (typeof value === 'symbol') {
                return `Symbol(${value.description})`
              } else {
                return value
              }
            }, 2)}\n${CODE}`)
        }
      } catch (err) {
        msg.reply(`${CODE}js\n${err.stack}\n${CODE}`)
      }
    }
  })

  client.login(token)
}
