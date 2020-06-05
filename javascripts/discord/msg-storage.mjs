const guildID = '710932856251351111'
const getConfigID = /moofy'?s *config *is *in *(\d+)/i
const getConfigJSON = /^```json\r?\n([^]+)\r?\n```$/

export default function main (token, { Client }) {
  // Create an instance of a Discord client
  const client = new Client()

  let channel, message
  let storage = {}

  function wait (time) {
    return new Promise(resolve => setTimeout(resolve, time))
  }

  async function loadConfig (messageID) {
    message = await channel.messages.fetch(messageID)
    if (message.author !== client.user) throw new Error('bad')
    const [, json] = message.content.match(getConfigJSON)
    return JSON.parse(json)
  }

  async function save () {
    await message.edit(`\`\`\`json\n${JSON.stringify(storage, null, 2)}\n\`\`\``)
  }

  async function hunt () {
    const guild = client.guilds.resolve(guildID)
    let messageID
    channel = guild.channels.cache.find(channel => {
      if (!channel.topic) return
      const match = channel.topic.match(getConfigID)
      if (match) {
        messageID = match[1]
        return true
      }
    })
    if (channel) storage = await loadConfig(messageID)
  }

  client.on('ready', async () => {
    await hunt()
    console.log('ready')
  })

  client.on('message', async msg => {
    if (msg.guild.id !== guildID || msg.author.bot) return
    if (msg.content === 'moofy test') {
      const message = await msg.channel.send('wait')
      await wait(5000)
      await message.edit('ok tada')
    } else if (msg.content === 'moofy resides here' && !channel) {
      message = await msg.channel.send('```json\n{}\n```')
      channel = msg.channel
      await save()
      msg.reply('ok add to the channel description `moofy\'s config is in ' + message.id + '` so i remember ok?')
    } else if (msg.content === 'moofy save') {
      await save()
        .then(() => {
          msg.reply('ok')
        })
        .catch(() => {
          msg.reply('problem with saving :(')
        })
    } else if (msg.content === 'moofy check again') {
      await hunt()
      if (channel) {
        msg.reply('ok found')
      } else {
        msg.reply('still cannot find')
      }
    } else if (msg.content === 'moofy' || msg.content === 'moofy help') {
      msg.reply('moofy resides here, moofy save, moofy check again, moofy get <path>, moofy set <path> <json>, moofy test')
    } else {
      const match = msg.content.match(/^moofy (get|set)(?: (\S+)(?: (.+))?)?$/)
      if (!match) return
      const [, mode, path = '', value] = match
      const keys = path.split('/').filter(key => key)
      let set
      if (mode === 'set') set = keys.pop()
      let current = storage
      for (const key of keys) {
        if (!current[key]) {
          if (mode === 'get') {
            current = current[key]
            break
          } else {
            current[key] = {}
          }
        }
        current = current[key]
      }
      if (mode === 'get') {
        if (current !== undefined) {
          await msg.reply(`\`\`\`json\n${JSON.stringify(current, null, 2)}\n\`\`\``)
        } else {
          await msg.reply('nothing there ok')
        }
      } else {
        current[set] = JSON.parse(value)
        msg.reply('ok done dont forget to save ya?')
      }
    }
  })

  client.login(token)
}
