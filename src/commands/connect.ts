import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UsersService } from '../services/user.service';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Direct you to the website to connect your fantasy account and discord'),
	async execute(interaction: ChatInputCommandInteraction) {
		const userService = new UsersService();
		const user = await userService.findByDiscordId(interaction.user.id);
		let msg = 'Connect your fantasy account to your discord here: https://www.efit-web.site';
		if (user) {
			msg = 'You have already connected your accounts: https://www.efit-web.site';
		}
		await interaction.reply({
			content: msg,
			ephemeral: true,
		});
	},
};
