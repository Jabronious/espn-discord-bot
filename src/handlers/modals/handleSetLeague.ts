import { ModalSubmitInteraction } from 'discord.js';
import { BaseModalHandler } from '../../types/modal-handler';

export class SetLeagueModalHandler extends BaseModalHandler {
	modalId = 'setLeague';

	handle(interaction: ModalSubmitInteraction): void {
		// Implementation specific to the 'setLeague' modal
		const leagueId = interaction.fields.getTextInputValue('leagueId');
		console.log(`League ID submitted: ${leagueId}`);
		interaction.reply({ content: `League ID set to: ${leagueId}`, ephemeral: true });
	}
}
