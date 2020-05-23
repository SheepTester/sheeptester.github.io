export default async function main (token, { Client }) {
  // Create an instance of a Discord client
  const client = new Client()

  client.on('ready', () => {
    client.user.setPresence({ activity: { name: 'Message me directly' } })
  })

  let channel

  client.on('message', msg => {
    if (!msg.author.bot) {
      if (msg.mentions.has(client.user)) {
        console.log(`${msg.author.tag} changed the channel to ${msg.channel}`)
        channel = msg.channel
      } else if (msg.channel.type === 'dm') {
        if (channel) {
          console.log(`${msg.author.tag} sent a message`)
          channel.send(msg.content)
        }
      }
    }
  })

  await client.login(token)
}
