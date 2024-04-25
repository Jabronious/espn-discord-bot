import { REST, Routes } from 'discord.js';
import { configs } from '../configuration';
import { logger } from '../services/logger';

const rest = new REST({ version: '10' }).setToken(configs.FBB_BOT_TOKEN);

// for guild-based commands
rest.put(Routes.applicationCommands(configs.FBB_BOT_CLIENT_ID), {
	body: [],
})
	.then(() => logger.info('Successfully deleted all global commands.'))
	.catch(logger.error);
