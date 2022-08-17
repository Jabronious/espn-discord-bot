import { REST, Routes } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import { configs } from '../configuration';

const commands = [];
const commandsPath = path.join(__dirname);
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file !== 'index.ts' && file.endsWith('.ts'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(configs.FBB_BOT_TOKEN);

rest.put(Routes.applicationCommands(configs.FBB_BOT_CLIENT_ID) as unknown as `/${string}`, { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
