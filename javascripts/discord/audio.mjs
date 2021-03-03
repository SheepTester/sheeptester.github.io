export default async function main (token, { Client }) {
  const client = new Client()

  client.on('message', async message => {
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    if (!message.guild) return

    if (message.content.startsWith(':play')) {
      const url = message.content.slice(5).trim()
      if (!/^https?:\/\//.test(url)) {
        message.reply('Specify a URL to an audio file.')
        return
      }
      // Only try to join the sender's voice channel if they are in one themselves
      if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join()
        const dispatcher = connection.play(url)
        dispatcher.on('error', console.error)
        await new Promise(resolve => dispatcher.on('finish', resolve))
        connection.disconnect()
      } else {
        message.reply('Join a voice channel. *NOW*.')
      }
    }
  })

  await client.login(token)
}
