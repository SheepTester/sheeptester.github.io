import Discord from './discord.js'

const { Client } = Discord

const CODE = '```'
const evalRegex = /\beval\s*\(?\s*```(?:js|javascript)?([^]+)```\s*\)?/

function displayValue (value) {
  switch (typeof value) {
    case 'function': {
      return `${CODE}js\n${value.toString()}\n${CODE}`
    }
    case 'symbol': {
      return `${CODE}js\nSymbol(${value.description})\n${CODE}`
    }
    case 'bigint': {
      return `${CODE}js\n${value}n\n${CODE}`
    }
    case 'string': {
      return value
    }
    case 'undefined': {
      return `${CODE}js\nundefined\n${CODE}`
    }
    default: {
      return `${CODE}js\n${JSON.stringify(
        value,
        (_, value) => {
          if (typeof value === 'function') {
            return value.toString()
          } else if (typeof value === 'symbol') {
            return `Symbol(${value.description})`
          } else {
            return value
          }
        },
        2
      )}\n${CODE}`
    }
  }
}

const makeWorker = js => `
self.reply = content => {
  self.postMessage(JSON.stringify({ type: 'reply', content }))
}
self.guilds = () => {
  self.postMessage(JSON.stringify({ type: 'guilds' }))
}
self.CODE = '${CODE}'

;(async () => {
  try {
    ${displayValue}
    reply(displayValue(await (0, eval)(${JSON.stringify(js)})))
  } catch (error) {
    self.postMessage(
      JSON.stringify({
        type: 'error',
        error: error.stack
      })
    )
  }
})()
`

export default function main (token) {
  // Create an instance of a Discord client
  const client = new Client()

  client.on('ready', () => {
    console.log('ok')
  })

  client.on('message', async msg => {
    if (msg.mentions.has(client.user)) {
      return msg.reply(
        'do `eval` followed by a code block to have me run arbitrary code!\n```ts\n// Available globally\nvar CODE: string\nfunction reply (content: string): void\nfunction guilds (): void\n```'
      )
    }
    const match = msg.content.match(evalRegex)
    if (match) {
      const worker = new Worker(
        URL.createObjectURL(new Blob([makeWorker(match[1])]))
      )

      worker.addEventListener('message', async event => {
        const data = JSON.parse(event.data)
        switch (data.type) {
          case 'reply': {
            await msg.reply(data.content)
            break
          }
          case 'guilds': {
            await msg.reply(
              client.guilds.cache
                .values()
                .map(name => `\`${name}\``)
                .join(', ')
            )
            break
          }
          case 'error': {
            msg.reply(`${CODE}js\n${data.error}\n${CODE}`)
          }
        }
      })
      worker.addEventListener('error', event => {
        msg.reply(
          `${CODE}js\n${event.message}\n\tat ${event.lineno}:${event.colno}\n${CODE}`
        )
      })
      setTimeout(() => {
        worker.terminate()
      }, 10000)
    }
  })

  client.login(token)
}
