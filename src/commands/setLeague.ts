import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ModalActionRowComponentBuilder,
	ModalBuilder,
	SlashCommandBuilder,
	TextInputBuilder,
	TextInputStyle,
} from 'discord.js';

module.exports = {
	data: new SlashCommandBuilder()
		.setDefaultMemberPermissions(0)
		.setName('set_league')
		.setDescription(
			'Prompt you for the league you wish to use in this channel.\nLeague Id is a public identifier.'
		),
	async execute(interaction: ChatInputCommandInteraction) {
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
