import path from 'path';
import fs from 'fs';
import { configs } from '../configuration';
import { Client, ClientOptions, Collection } from 'discord.js';

export class ClientWithCommands extends Client {
	commands = new Collection();

	constructor(options: ClientOptions) {
		super(options);

		const fileType = configs.isDevelopment ? 'ts' : 'js';
		const commandsPath = path.join(__dirname, '..', 'commands');
		const commandFiles = fs
			.readdirSync(commandsPath)
			.filter((file) => file !== `index.${fileType}` && file.endsWith(`.${fileType}`));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			this.commands.set(command.data.name, command);
		}
	}
}
