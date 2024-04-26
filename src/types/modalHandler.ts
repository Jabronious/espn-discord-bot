import { ModalSubmitInteraction } from 'discord.js';

export abstract class BaseModalHandler {
	abstract modalId: string;
	abstract handle(interaction: ModalSubmitInteraction): Promise<void>;
}
