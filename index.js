// Import dotenv
require('dotenv').config();

// Import discord.js
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Routes, REST, Collection } = require('discord.js');

const { TOKEN, CLIENT_ID, GUILD_ID } = process.env;

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// When bot is ready
client.once(Events.ClientReady, () => 
{
  console.log(`Logged in as ${client.user.tag}!`);
});

// Message listener
client.on('messageCreate', message => 
{
  if (message.author.bot) return; // ignore other bots

  if (message.content === '!ping') 
  {
    message.reply('🏓 Pong!');
  }

  if (message.content === '!pong') 
  {
    message.reply('Tahu Pong!');
  }

  if (message.content === '!pung') 
  {
    message.reply('Bopung!');
  }
});

// Define slash commands
const commands = [];
client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) 
{
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));
	
  for (const file of commandFiles) 
  {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);

		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) 
    {
      client.commands.set(command.data.name, command);
			commands.push(command.data.toJSON());
		} 
    else 
    {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// Register slash commands
const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
  try 
  {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );
    console.log('Slash commands registered!');
  } 
  catch (error) 
  {
    console.error(error);
  }
})();

// Respond to slash commands
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  
  const command = client.commands.get(interaction.commandName);

  if (!command) 
  {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
  }

  await command.execute(interaction);
});

// Login the bot
client.login(TOKEN);
