import { Client, Events, GatewayIntentBits, MessageFlags, type SendableChannels } from 'discord.js';
import { BlizzardClient } from './blizzard.js';
import { handleWowCommand, wowCommand } from './commands.js';
import { loadConfig } from './config.js';
import { Store } from './store.js';
import { Tracker } from './tracker.js';

const config = loadConfig();
const store = new Store(config.dataFile);
const provider = new BlizzardClient({
	clientId: config.blizzardClientId,
	clientSecret: config.blizzardClientSecret,
	namespace: config.namespace,
	locale: config.locale,
});

// Only the Guilds intent is needed for slash commands; no privileged intents.
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function announce(guildId: string, message: string): Promise<void> {
	const channelId = store.getGuild(guildId).announceChannelId;
	if (!channelId) return;
	try {
		const channel = await client.channels.fetch(channelId);
		if (!channel?.isSendable()) {
			console.warn(`Announcement channel ${channelId} in guild ${guildId} is not sendable`);
			return;
		}
		await (channel as SendableChannels).send({ content: message, allowedMentions: { parse: ['users'] } });
	} catch (err) {
		console.error(`Failed to announce in guild ${guildId}:`, err);
	}
}

const tracker = new Tracker(store, provider, announce, {
	maxLevel: config.maxLevel,
	delayBetweenRequestsMs: 250,
	log: (m) => console.warn(m),
});

client.once(Events.ClientReady, async (ready) => {
	console.log(`Logged in as ${ready.user.tag}, in ${ready.guilds.cache.size} server(s)`);

	const body = [wowCommand.toJSON()];
	if (config.devGuildId) {
		await ready.application.commands.set(body, config.devGuildId);
		console.log(`Registered slash commands to guild ${config.devGuildId}`);
	} else {
		await ready.application.commands.set(body);
		console.log('Registered slash commands globally');
	}

	const run = () => tracker.checkAll().catch((err) => console.error('Level check failed:', err));
	run();
	setInterval(run, config.pollIntervalMs);
	console.log(`Checking ${store.allCharacters().length} character(s) every ${config.pollIntervalMs / 60_000} min`);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand() || interaction.commandName !== wowCommand.name) return;
	try {
		await handleWowCommand(interaction, { config, store, provider });
	} catch (err) {
		console.error('Command failed:', err);
		const content = 'Something went wrong handling that command.';
		if (interaction.deferred || interaction.replied) {
			await interaction.editReply(content).catch(() => undefined);
		} else {
			await interaction.reply({ content, flags: MessageFlags.Ephemeral }).catch(() => undefined);
		}
	}
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.on(signal, async () => {
		console.log(`Received ${signal}, shutting down`);
		await client.destroy();
		process.exit(0);
	});
}

await client.login(config.discordToken);
