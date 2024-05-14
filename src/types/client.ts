import path from 'path';
import fs, { existsSync, readdirSync } from 'fs';
import { configs } from '../configuration';
import { Client as BaseClient, ClientOptions, Collection } from 'discord.js';
import { BaseModalHandler } from './modalHandler';

export class Client extends BaseClient {
	commands = new Collection();
	modalHandlers: Record<string, BaseModalHandler> = {};

	constructor(options: ClientOptions) {
		super(options);

		this.loadCommands();
		this.loadModalHandlers();
	}

	private loadModalHandlers() {
		const modalsDirectory = path.join(__dirname, '..', 'handlers', 'modals');
		const commandsDirectory = path.join(__dirname, '..', 'commands');
		const fileType = configs.isLocal ? 'ts' : 'js';

		readdirSync(modalsDirectory).forEach((file) => {
			const filePath = path.join(modalsDirectory, file);
			const modalHandler = require(filePath); // Adjust based on export
			Object.keys(modalHandler).forEach((key) => {
				const modalHandlerClass = modalHandler[key];
				if (modalHandlerClass && modalHandlerClass.prototype instanceof BaseModalHandler) {
					const handlerInstance = new modalHandlerClass();
					const commandExists = existsSync(
						path.join(commandsDirectory, `${handlerInstance.modalId}.${fileType}`)
					);

					if (!commandExists) {
						throw new Error(`No corresponding command found for modal ID: ${handlerInstance.modalId}`);
					}

					this.modalHandlers[handlerInstance.modalId] = handlerInstance;
				} else {
					throw new Error(`Invalid modal handler in file: ${file}`);
				}
			});
		});
	}

	private loadCommands() {
		const fileType = configs.isLocal ? 'ts' : 'js';
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
