import { REST, Routes } from 'discord.js';
import { configs } from '../configuration';

const rest = new REST({ version: '10' }).setToken(configs.FBB_BOT_TOKEN);

// for guild-based commands
rest.put(Routes.applicationGuildCommands(configs.FBB_BOT_CLIENT_ID, '827907164780756992'), {
	body: [],
})
	.then(() => console.log('Successfully deleted all guild commands.'))
	.catch(console.error);
