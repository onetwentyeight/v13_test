const fs = require('fs');
const Discord = require('discord.js');
const { prefix: defaultPrefix } = require('./config.json'); // Load default prefix from config.json

const client = new Discord.Client();
client.commands = new Discord.Collection();

// Load commands from ./commands directory
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

// Load prefixes from ./prefixes.json
let prefixes = {};
try {
  prefixes = require('./prefixes.json');
} catch (err) {
  console.error('Error loading prefixes:', err);
}

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', message => {
  // Ignore messages from bots and DMs
  if (message.author.bot || !message.guild) return;

  // Get guild prefix from prefixes object or default prefix
  const guildPrefix = prefixes[message.guild.id] || defaultPrefix;

  // Parse command and arguments from message content
  if (message.content.startsWith(guildPrefix)) {
    const args = message.content.slice(guildPrefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Execute command if it exists
    const command = client.commands.get(commandName)
      || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    if (!command) return;

    try {
      command.execute(message, args);
    } catch (error) {
      console.error(error);
      message.reply('there was an error trying to execute that command!');
    }
  }
});

client.login('your-token-goes-here');
