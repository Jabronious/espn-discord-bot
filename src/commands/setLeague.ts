import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	PermissionFlagsBits,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';
import { UsersService } from '../services/user.service';
import { configs } from '../configuration';

module.exports = {
	data: new SlashCommandBuilder()
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		.setName('set_league')
		.setDescription(
			'Prompt you for the league you wish to use in this channel.\nLeague Id is a public identifier.'
		),
	async execute(interaction: ChatInputCommandInteraction) {
		const userService = new UsersService();
		const user = await userService.findByDiscordId(interaction.user.id);
		if (!user) {
			await interaction.reply({
				content: `You must first connect your fantasy account: https://www.${configs.SUBDOMAIN}efit-web.site`,
				ephemeral: true,
			});
		}
		// TODO: Implement Caching to store temp User data
		const modal = new ModalBuilder().setCustomId('setLeague').setTitle('Set League');

		const leagueId = new TextInputBuilder()
			.setCustomId('leagueId')
			.setLabel('League ID')
			.setStyle(TextInputStyle.Short);

		const firstActionRow = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(leagueId);

		modal.addComponents(firstActionRow);

		await interaction.showModal(modal);
	},
};
