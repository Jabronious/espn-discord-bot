import { GatewayIntentBits } from 'discord.js';
import { configs } from './configuration';
import { Client } from './types/client';
import { Command } from './types/commands';
import mongoose from 'mongoose';
import { handleError } from './handlers/errors/errorHandler';
import { CommandDoesntExistError, DefaultError } from './handlers/errors/errors';
import { logger } from './services/logger';

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

// When the client is ready, run this code (only once)
client.once('ready', () => {
	mongoose.connect(configs.COSMOS_CONNECTION_STRING).catch((err) => {
		logger.error(err);
		throw err; // We do not want to deploy the bot if we dont have a proper connection
	});

	logger.info('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	try {
		if (interaction.isChatInputCommand()) {
			const command = client.commands.get(interaction.commandName) as Command;

			await command.execute(interaction);
		} else if (interaction.isModalSubmit()) {
			const handler = client.modalHandlers[interaction.customId];
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

process.on('unhandledRejection', (error: DefaultError) => {
	handleError(error, undefined, 'Unhandled Rejection at Promise');
});

process.on('uncaughtException', (error: DefaultError) => {
	handleError(error, undefined, 'Uncaught Exception thrown');
	process.exit(1);
});
