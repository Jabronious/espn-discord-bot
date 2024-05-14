import { ModalSubmitInteraction, PermissionFlagsBits } from 'discord.js';
import { BaseModalHandler } from '../../types/modalHandler';
import { LeagueConnectionService } from '../../services/leagueConnection.service';
import { InvalidInput, NotFound, UnauthorizedError, UnreachableError } from '../errors/errors';
import { League } from 'espn-fantasy-baseball';
import { UsersService } from '../../services/user.service';
import { EncryptDecryptService } from '../../services/encrypt-decrypt.serivce';

export class SetLeagueModalHandler extends BaseModalHandler {
	modalId = 'setLeague';

	async handle(interaction: ModalSubmitInteraction): Promise<void> {
		const userService = new UsersService();
		const user = await userService.findByDiscordId(interaction.user.id);
		if (!user) {
			throw new NotFound('User was not found');
		}
		// Implementation specific to the 'setLeague' modal
		if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)) {
			throw new UnauthorizedError(
				`Incorrect permissions on \`set_league\` command for member: ${interaction.user.displayName}`,
				false
			);
		}

		const leagueId = interaction.fields.getTextInputValue('leagueId') as unknown as number;
		if (isNaN(leagueId)) {
			throw new InvalidInput(`${leagueId} is not valid input`);
		}

		const encryptDecryptService = new EncryptDecryptService();
		const league = new League(leagueId, {
			espn_s2: await encryptDecryptService.decrypt(user.espn_s2),
			swid: await encryptDecryptService.decrypt(user.swid),
		});

		const isLeagueManager = await league.isLeagueManager().catch(() => {
			throw new Error('There was an issue finding your league. Check your league id and try again.');
		});

		if (!isLeagueManager) {
			throw new UnauthorizedError('You do not have permission to set the league');
		}

		const guildId = interaction.guildId;
		if (!guildId) {
			throw new UnreachableError('Discord server ID was not included in the interaction.');
		}

		const leagueConnectionService = new LeagueConnectionService();
		await leagueConnectionService.createLeagueConnection(guildId, String(league.leagueId));

		interaction.reply({ content: `League ID set to: ${leagueId}`, ephemeral: true });
	}
}
