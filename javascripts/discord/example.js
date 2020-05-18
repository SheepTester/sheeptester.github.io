import Discord from './discord.js'

const { Client, MessageEmbed } = Discord

export default function main (token) {
  // Create an instance of a Discord client
  const client = new Client()

  /**
   * The ready event is vital, it means that only _after_ this will your bot start reacting to information
   * received from Discord
   */
  client.on('ready', () => {
    console.log('I am ready!')
  })

  client.on('message', message => {
    if (message.content === 'ping') {
      // Send "pong" to the same channel
      message.channel.send('pong')
    } else if (message.content === 'what is my avatar') {
      // Send the user's avatar URL
      message.reply(message.author.displayAvatarURL())
    } else if (message.content === 'how to embed') {
      // We can create embeds using the MessageEmbed constructor
      // Read more about all that you can do with the constructor
      // over at https://discord.js.org/#/docs/main/master/class/MessageEmbed
      const embed = new MessageEmbed()
        // Set the title of the field
        .setTitle('A slick little embed')
        // Set the color of the embed
        .setColor(0xff0000)
        // Set the main content of the embed
        .setDescription('Hello, this is a slick embed!')
      // Send the embed to the same channel as the message
      message.channel.send(embed)
    }
  })

  // Log our bot in using the token from https://discordapp.com/developers/applications/me
  client.login(token)
}
