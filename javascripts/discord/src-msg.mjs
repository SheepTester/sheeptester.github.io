export default async function main (token, { Client }) {

  const client = new Client()
//client.options.disableMentions = 'all'
  client.on('message', async msg => {
    if (msg.author.bot) return
    if (msg.content.includes('echó')) {
      await msg.channel.send(msg.content, {
        allowedMentions: {
          parsed: []
        }
      })
      return
    }
    if (msg.content.startsWith('cat')) {
      const wiggle = msg.content.replace(/cat/g, '')

      await msg.channel.send({
        embed: {
          title: wiggle,
          description: wiggle,
          author: {text: wiggle },
          footer: {
            text: wiggle
          }
        }
      })
      return
    }
        let match = msg.content.match(/anyways (\d+)/)
    if (match) {
    const message = await msg.channel.messages.fetch(match[1])
      .then(m => m.content)
      .catch(() => 'uwu couldnt find msg in this channel sad')
   await msg.channel.send('ok lol.', {
      embed: {
        description: '```md\n' + message + '```'
      }
    })
      return
    }

  })

  
  await client.login(token)
}
