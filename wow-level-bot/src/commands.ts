import {
	ChannelType,
	InteractionContextType,
	MessageFlags,
	PermissionFlagsBits,
	SlashCommandBuilder,
	type ChatInputCommandInteraction,
} from 'discord.js';
import { toRealmSlug, type CharacterProvider } from './blizzard.js';
import type { Config } from './config.js';
import { characterKey, type Store } from './store.js';

const REGIONS = ['us', 'eu', 'kr', 'tw'];

export const wowCommand = new SlashCommandBuilder()
	.setName('wow')
	.setDescription('Track World of Warcraft characters and announce level ups')
	.setContexts(InteractionContextType.Guild)
	.addSubcommand((sub) =>
		sub
			.setName('track')
			.setDescription('Start tracking one of your characters')
			.addStringOption((o) => o.setName('name').setDescription('Character name').setRequired(true))
			.addStringOption((o) => o.setName('realm').setDescription('Realm name, e.g. "Living Flame"'))
			.addStringOption((o) =>
				o
					.setName('region')
					.setDescription('Region (defaults to the bot setting)')
					.addChoices(...REGIONS.map((r) => ({ name: r.toUpperCase(), value: r }))),
			),
	)
	.addSubcommand((sub) =>
		sub
			.setName('untrack')
			.setDescription('Stop tracking a character')
			.addStringOption((o) => o.setName('name').setDescription('Character name').setRequired(true))
			.addStringOption((o) => o.setName('realm').setDescription('Realm name'))
			.addStringOption((o) =>
				o
					.setName('region')
					.setDescription('Region')
					.addChoices(...REGIONS.map((r) => ({ name: r.toUpperCase(), value: r }))),
			),
	)
	.addSubcommand((sub) => sub.setName('list').setDescription('Show every tracked character in this server'))
	.addSubcommand((sub) =>
		sub
			.setName('channel')
			.setDescription('Choose where level ups are announced (requires Manage Server)')
			.addChannelOption((o) =>
				o
					.setName('channel')
					.setDescription('Defaults to this channel')
					.addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
			),
	);

interface Deps {
	config: Config;
	store: Store;
	provider: CharacterProvider;
}

function resolveTarget(interaction: ChatInputCommandInteraction, config: Config) {
	const name = interaction.options.getString('name', true).trim();
	const realm = interaction.options.getString('realm')?.trim() || config.defaultRealm;
	const region = interaction.options.getString('region') ?? config.defaultRegion;
	return { name, realm, region };
}

export async function handleWowCommand(interaction: ChatInputCommandInteraction, deps: Deps): Promise<void> {
	if (!interaction.inGuild()) {
		await interaction.reply({ content: 'This command only works in a server.', flags: MessageFlags.Ephemeral });
		return;
	}
	switch (interaction.options.getSubcommand()) {
		case 'track':
			return track(interaction, deps);
		case 'untrack':
			return untrack(interaction, deps);
		case 'list':
			return list(interaction, deps);
		case 'channel':
			return setChannel(interaction, deps);
	}
}

async function track(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, { config, store, provider }: Deps) {
	const { name, realm, region } = resolveTarget(interaction, config);
	if (!realm) {
		await interaction.reply({ content: 'Please include a `realm`.', flags: MessageFlags.Ephemeral });
		return;
	}
	const realmSlug = toRealmSlug(realm);
	const nameKey = name.toLowerCase();
	const key = characterKey({ guildId: interaction.guildId, region, realmSlug, nameKey });

	if (store.find(key)) {
		await interaction.reply({ content: `**${name}** is already being tracked here.`, flags: MessageFlags.Ephemeral });
		return;
	}
	const mine = store.guildCharacters(interaction.guildId).filter((c) => c.ownerId === interaction.user.id);
	if (mine.length >= config.maxCharactersPerUser) {
		await interaction.reply({
			content: `You're already tracking ${mine.length} characters (the limit is ${config.maxCharactersPerUser}).`,
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	await interaction.deferReply();
	let info;
	try {
		info = await provider.getCharacter(region, realmSlug, nameKey);
	} catch (err) {
		console.error('Lookup failed', err);
		await interaction.editReply("Couldn't reach the Blizzard API right now. Try again in a bit.");
		return;
	}
	if (!info) {
		await interaction.editReply(
			`Couldn't find **${name}** on **${realm}** (${region.toUpperCase()}). Check the spelling and realm. ` +
				'Brand-new characters can take a little while to show up in the API.',
		);
		return;
	}

	await store.add({
		guildId: interaction.guildId,
		ownerId: interaction.user.id,
		region,
		realmSlug,
		nameKey,
		displayName: info.name,
		realmName: info.realmName,
		className: info.className,
		level: info.level,
		addedAt: new Date().toISOString(),
		lastCheckedAt: new Date().toISOString(),
	});

	// First character tracked in a server: announce in the channel it was added from.
	if (!store.getGuild(interaction.guildId).announceChannelId) {
		await store.setAnnounceChannel(interaction.guildId, interaction.channelId);
	}

	await interaction.editReply(
		`Now tracking **${info.name}**${info.className ? ` (${info.className})` : ''} on ${info.realmName}, ` +
			`currently level **${info.level}**. Level ups will be announced in <#${store.getGuild(interaction.guildId).announceChannelId}>.`,
	);
}

async function untrack(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, { config, store }: Deps) {
	const { name, realm, region } = resolveTarget(interaction, config);
	const matches = store
		.guildCharacters(interaction.guildId)
		.filter(
			(c) =>
				c.nameKey === name.toLowerCase() &&
				c.region === region &&
				(!realm || c.realmSlug === toRealmSlug(realm)),
		);

	if (matches.length === 0) {
		await interaction.reply({ content: `**${name}** isn't being tracked here.`, flags: MessageFlags.Ephemeral });
		return;
	}
	if (matches.length > 1) {
		await interaction.reply({
			content: `More than one **${name}** is tracked here. Please include the \`realm\`.`,
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const target = matches[0];
	const isAdmin = interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild) ?? false;
	if (target.ownerId !== interaction.user.id && !isAdmin) {
		await interaction.reply({
			content: 'Only the person who added that character (or a server manager) can untrack it.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	await store.remove(characterKey(target));
	await interaction.reply(`Stopped tracking **${target.displayName}** on ${target.realmName}.`);
}

async function list(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, { store }: Deps) {
	const characters = store
		.guildCharacters(interaction.guildId)
		.sort((a, b) => b.level - a.level || a.displayName.localeCompare(b.displayName));

	if (characters.length === 0) {
		await interaction.reply({
			content: 'Nobody is being tracked yet. Use `/wow track` to add your character.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	const lines = characters.map(
		(c, i) =>
			`${i + 1}. **${c.displayName}** - level ${c.level}${c.className ? ` ${c.className}` : ''} ` +
			`(${c.realmName}, ${c.region.toUpperCase()}) - <@${c.ownerId}>`,
	);
	// Discord messages max out at 2000 characters.
	let content = '';
	for (const line of lines) {
		if (content.length + line.length + 1 > 1900) {
			content += `\n...and ${lines.length - content.split('\n').length} more`;
			break;
		}
		content += (content ? '\n' : '') + line;
	}
	await interaction.reply({ content, allowedMentions: { parse: [] } });
}

async function setChannel(interaction: ChatInputCommandInteraction<'cached' | 'raw'>, { store }: Deps) {
	if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
		await interaction.reply({
			content: 'You need the **Manage Server** permission to change the announcement channel.',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	const channelId = interaction.options.getChannel('channel')?.id ?? interaction.channelId;
	await store.setAnnounceChannel(interaction.guildId, channelId);
	await interaction.reply(`Level ups will now be announced in <#${channelId}>.`);
}
