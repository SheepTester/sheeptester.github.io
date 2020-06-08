export default function main (token, {
  Client
}) {
  const client = new Client()

  client.on('ready', async () => {
    await client.user.setPresence({
      activity: {
        name: 'only works in dm',
        type: 'LISTENING'
      }
    })
    console.log('ready')
  })

  client.on('message', async msg => {
    if (msg.author.bot || msg.channel.type !== 'dm') return
    console.log(msg.content, msg.attachments)
    await msg.react('👍')
  })

  client.login(token)
}

