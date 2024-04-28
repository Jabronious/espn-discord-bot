import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { UsersService } from '../services/user.service';
import { configs } from '../configuration';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('connect')
		.setDescription('Direct you to the website to connect your fantasy account and discord'),
	async execute(interaction: ChatInputCommandInteraction) {
		const url = `https://www.${configs.SUBDOMAIN}efit-web.site`;
		const userService = new UsersService();
		const user = await userService.findByDiscordId(interaction.user.id);
		let msg = `Connect your fantasy account to your discord here: ${url}`;
		if (user) {
			msg = `You have already connected your accounts: ${url}`;
		}
		await interaction.reply({
			content: msg,
			ephemeral: true,
		});
	},
};
