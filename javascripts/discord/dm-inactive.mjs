const guildId = '710932856251351111'
const verifiedId = '713633126253068300'
const myId = '212355530474127361'

const autoMsg = `Hi, you're receiving this automated message because you're still unverified in the unofficial Discord server for Gunn High School.

Go to <#713633282805465180> to find out how to verify yourself, or you can leave the server. Note that you don't have to be a Gunn student to verify!

We might kick you later if you don't verify soon. Thanks and have a nice day! <:bobageff:736103290890354709>`

export default function main (token, { Client }) {
  // Create an instance of a Discord client
  const client = new Client()

  client.on('ready', async () => {
    console.log('ready')
    const guild = client.guilds.cache.get(guildId)
    for (const member of (await guild.members.fetch()).values()) {
      if (!member.user.bot && !member.roles.cache.has(verifiedId)) {
        // await member.send(autoMsg)
        console.log(`${member.user.tag} ${member}`)
      }
      if (member.user.id === myId) {
        await member.send(autoMsg)
      }
    }
    console.log('done')
  })

  client.login(token)
}
