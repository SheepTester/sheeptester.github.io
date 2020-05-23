const guildID = '710932856251351111'
const verifiedID = '713633126253068300'
const botID = '710955296230604852'

export default function main (token, { Client }) {
  // Create an instance of a Discord client
  const client = new Client()

  client.on('ready', async () => {
    console.log('ready')
    const guild = client.guilds.cache.get(guildID)
    for (const member of (await guild.members.fetch()).values()) {
      if (!member.roles.cache.has(verifiedID) && !member.roles.cache.has(botID)) {
        await member.roles.add(verifiedID, 'Auto-giving everyone verified -Moofy')
      }
    }
    console.log('done')
  })

  client.login(token)
}
