import { SlashCommandBuilder } from '@discordjs/builders';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { configs } from './configuration';

const commands = [
	new SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
	new SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
	new SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
].map((command) => command.toJSON());

const rest = new REST({ version: '9' }).setToken(configs.FBB_BOT_TOKEN);

rest.put(Routes.applicationGuildCommands(configs.FBB_BOT_CLIENT_ID, '827907164780756992') as unknown as `/${string}`, {
	body: commands,
})
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
