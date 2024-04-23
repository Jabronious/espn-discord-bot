import { GatewayIntentBits } from 'discord.js';
import { configs } from './configuration';
import { ClientWithCommands } from './types/client-with-commands';
import { Command } from './types/commands';
import mongoose from 'mongoose';
import path from 'path';
import { BaseModalHandler } from './types/modal-handler';
import { existsSync, readdirSync } from 'fs';

const modalHandlers: Record<string, BaseModalHandler> = {};

// Create a new client instance
const client = new ClientWithCommands({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	mongoose.connect(configs.COSMOS_CONNECTION_STRING).catch((err) => console.log(err));

	loadModalHandlers();

	console.log('Ready!');
});

client.on('interactionCreate', async (interaction) => {
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName) as Command;

		if (!command) return;
		try {
			await command.execute(interaction);
		} catch (error) {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} else if (interaction.isModalSubmit()) {
		const handler = modalHandlers[interaction.customId];
		if (handler) {
			handler.handle(interaction);
		} else {
			console.error(`No handler found for modal with custom ID: ${interaction.customId}`);
		}
	} else {
		return;
	}
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
