import { REST, Routes } from 'discord.js';
import { configs } from '../configuration';

const rest = new REST({ version: '10' }).setToken(configs.FBB_BOT_TOKEN);

// for guild-based commands
rest.put(Routes.applicationCommands(configs.FBB_BOT_CLIENT_ID) as unknown as `/${string}`, {
	body: [],
})
	.then(() => console.log('Successfully deleted all global commands.'))
	.catch(console.error);
