export default async function main (token, { Client }) {
  // Create an instance of a Discord client
  const client = new Client()

  let channel

  client.on('message', async message => {
    // Voice only works in guilds, if the message does not come from a guild,
    // we ignore it
    if (!message.guild) return

    if (message.content === '/join') {
      // Only try to join the sender's voice channel if they are in one themselves
      if (message.member.voice.channel) {
        const connection = await message.member.voice.channel.join()
        const dispatcher = connection.play('https://sheeptester.github.io/yesnt/sounds/sohum.mp3')
      } else {
        message.reply('You need to join a voice channel first!')
      }
    }
  })

  await client.login(token)
}
