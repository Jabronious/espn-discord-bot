import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { configs } from '../configuration';
import { logger } from '../services/logger';

const commands = [];
const commandsPath = path.join(__dirname);
const fileType = configs.isDevelopment ? 'ts' : 'js';
const commandFiles = fs
	.readdirSync(commandsPath)
	.filter((file) => file !== `index.${fileType}` && file.endsWith(`.${fileType}`));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(configs.FBB_BOT_TOKEN);

rest.put(Routes.applicationCommands(configs.FBB_BOT_CLIENT_ID), { body: commands })
	.then(() => logger.info(`${commands.length} commands successfully registered application commands.`))
	.catch(logger.error);
