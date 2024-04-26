import { GatewayIntentBits } from 'discord.js';
import { configs } from './configuration';
import { ClientWithCommands } from './types/clientWithCommands';
import { Command } from './types/commands';
import mongoose from 'mongoose';
import path from 'path';
import { BaseModalHandler } from './types/modalHandler';
import { existsSync, readdirSync } from 'fs';
import { handleError } from './handlers/errors/errorHandler';
import { CommandDoesntExistError, DefaultError } from './handlers/errors/errors';
import { logger } from './services/logger';

const modalHandlers: Record<string, BaseModalHandler> = {};

// Create a new client instance
const client = new ClientWithCommands({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	mongoose.connect(configs.COSMOS_CONNECTION_STRING).catch((err) => {
		logger.error(err);
		throw err; // We do not want to deploy the bot if we dont have a proper connection
	});

	loadModalHandlers();

	logger.info('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	try {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName) as Command;

			await command.execute(interaction);
		} else if (interaction.isModalSubmit()) {
			const handler = modalHandlers[interaction.customId];
			if (handler) {
				await handler.handle(interaction);
			} else {
				throw new CommandDoesntExistError(`No handler found for modal with custom ID: ${interaction.customId}`);
			}
		} else {
			return;
		}
	} catch (error: any) {
		handleError(error, interaction);
	}
});

client.on('error', (error) => {
	logger.error('An unexpected error occurred:', error);
});

// Login to Discord with your client's token
client.login(configs.FBB_BOT_TOKEN);

function loadModalHandlers() {
	const modalsDirectory = path.join(__dirname, 'handlers', 'modals');
	const commandsDirectory = path.join(__dirname, 'commands');

	readdirSync(modalsDirectory).forEach((file) => {
		if (path.extname(file) === '.ts') {
			const filePath = path.join(modalsDirectory, file);
			const modalHandler = require(filePath); // Adjust based on export
			Object.keys(modalHandler).forEach((key) => {
				const modalHandlerClass = modalHandler[key];
				if (modalHandlerClass && modalHandlerClass.prototype instanceof BaseModalHandler) {
					const handlerInstance = new modalHandlerClass();
					const commandExists = existsSync(path.join(commandsDirectory, `${handlerInstance.modalId}.ts`));

					if (!commandExists) {
						throw new Error(`No corresponding command found for modal ID: ${handlerInstance.modalId}`);
					}

					modalHandlers[handlerInstance.modalId] = handlerInstance;
				} else {
					throw new Error(`Invalid modal handler in file: ${file}`);
				}
			});
		}
	});
}

process.on('unhandledRejection', (error: DefaultError) => {
	handleError(error, undefined, 'Unhandled Rejection at Promise');
});

process.on('uncaughtException', (error: DefaultError) => {
	handleError(error, undefined, 'Uncaught Exception thrown');
	process.exit(1);
});
