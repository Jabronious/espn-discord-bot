// error-handler.ts
// import { Logger } from 'some-logging-library';
// const logger = new Logger();

import { BaseInteraction } from 'discord.js';
import { DefaultError } from './errors';

export async function handleError(error: DefaultError, interaction?: BaseInteraction, context = '') {
	// logger.error(`${context}:`, error);
	console.log(error, context);
	if (interaction?.isRepliable()) {
		await interaction?.reply({
			content: error.message || 'There was an error while executing this command!',
			ephemeral: error.ephemeral,
		});
	}
}
