import { Client, Collection, Intents } from 'discord.js';
import { configs } from './configuration';

type ClientWithCommands = Client & { commands: Collection<unknown, unknown> | undefined };
// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

(client as ClientWithCommands).commands = new Collection();
// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const { commandName } = interaction;

	if (commandName === 'ping') {
		await interaction.reply('Pong!');
	} else if (commandName === 'server') {
		await interaction.reply('Server info.');
	} else if (commandName === 'user') {
		await interaction.reply('User info.');
	}
});

// Login to Discord with your client's token
client.login(configs.FBB_BOT_TOKEN);
