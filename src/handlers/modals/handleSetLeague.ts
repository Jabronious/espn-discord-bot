import { ModalSubmitInteraction, PermissionFlagsBits } from 'discord.js';
import { BaseModalHandler } from '../../types/modalHandler';
import { LeagueConnectionService } from '../../services/leagueConnection.service';
import { UnauthorizedError, UnreachableError } from '../errors/errors';

export class SetLeagueModalHandler extends BaseModalHandler {
	modalId = 'setLeague';

	async handle(interaction: ModalSubmitInteraction): Promise<void> {
		// Implementation specific to the 'setLeague' modal
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
			throw new UnauthorizedError(
				`Incorrect permissions on \`set_league\` command for member: ${interaction.user.displayName}`,
				false
			);
		}

		const leagueId = interaction.fields.getTextInputValue('leagueId');
		const guildId = interaction.guildId;

		if (!guildId) {
			throw new UnreachableError('Discord server ID was not included in the interaction.');
		}

		const leagueConnectionService = new LeagueConnectionService();
		await leagueConnectionService.createLeagueConnection(guildId, leagueId);

		interaction.reply({ content: `League ID set to: ${leagueId}`, ephemeral: true });
	}
}
