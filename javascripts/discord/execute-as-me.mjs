const trigger = 'execute as moofy run say'

export default function main (token, { Client }) {
  // Create an instance of a Discord client
  const client = new Client()

  client.on('message', async msg => {
    if (!msg.author.bot && msg.content.startsWith(trigger)) {
      await msg.channel.send(msg.content.slice(trigger.length))
    }
  })

  client.login(token)
}
