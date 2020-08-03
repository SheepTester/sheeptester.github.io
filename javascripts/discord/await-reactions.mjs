export default async function main (token, { Client }) {
  // Create an instance of a Discord client
  const client = new Client()

  client.on('message', async msg => {
    if (msg.author.bot) return

    if (msg.content === 'moofy') {
      const newMsg = await msg.reply('hao')
      await newMsg.react('😂')
      await newMsg.react('😎')
      try {
        console.log(await newMsg
          .awaitReactions(() => true, { time: 5000 }))
      } catch (err) {
        console.log(err)
      }
    }
  })

  await client.login(token)
}

