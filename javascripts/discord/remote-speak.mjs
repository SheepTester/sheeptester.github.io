import readline from 'readline'

function ask (rl, question) {
  return new Promise(resolve => {
    rl.question(question, resolve)
  })
}

export default async function main (token, { Client }) {
  // Create an instance of a Discord client
  const client = new Client()

  let channel

  client.on('message', msg => {
    if (!msg.author.bot && msg.mentions.has(client.user)) {
      channel = msg.channel
    }
  })

  await client.login(token)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  let answer
  do {
    answer = await ask(rl, 'Message: ')
    if (answer && channel) {
      channel.send(answer)
    }
  } while (answer)
  rl.close()
}
