require("dotenv").config();
const { Client, Events, GatewayIntentBits } = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(process.env.DISCORD_AUTH_TOKEN);

client.on("messageCreate", async (message) => {
  const announceChannel = client.channels.cache.get(
    process.env.ANNOUNCE_CHANNEL_ID
  ); // #general-chat
  if (!announceChannel) {
    console.log("Announce channel not found!");
    return;
  }

  const channel = client.channels.cache.get(process.env.NUMBER_GAME_CHANNEL_ID);
  if (!channel) {
    console.log("Number-game channel not found!");
    return;
  }

  if (message.channelId !== process.env.NUMBER_GAME_CHANNEL_ID) {
    return;
  }

  console.log(`New message: ${message.cleanContent}`);

  if (message.cleanContent === '1' || message.cleanContent === '2') {
    // ignore new game start
    return
  }

  const recentMessages = await channel.messages.fetch({
    limit: 5,
    cache: true,
    around: message.id,
  });

  let outOfSequence = false;

  let currentNumber = -1;
  for (let recentMessage of recentMessages) {
    if (currentNumber === -1) {
      currentNumber = parseInt(recentMessage[1].cleanContent);
      continue;
    }
    const nextNumber = parseInt(recentMessage[1].cleanContent);
    if (currentNumber - 1 != nextNumber) {
      console.log(currentNumber, nextNumber);
      outOfSequence = true;
      console.log("number out of sequence");
    }
    currentNumber = nextNumber;
  }

  if (isNaN(parseInt(message.cleanContent)) || outOfSequence) {
    const author = message.author.username;
    console.log(`number game fail: ${message} by ${author}`);
    announceChannel.send(`BETA: ${author} failed at number game.`);
  } else {
    console.log(`valid entry: ${message}`);
  }
});
