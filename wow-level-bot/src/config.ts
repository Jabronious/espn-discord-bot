export interface Config {
	discordToken: string;
	devGuildId?: string;
	blizzardClientId: string;
	blizzardClientSecret: string;
	defaultRegion: string;
	namespace: string;
	locale: string;
	defaultRealm?: string;
	pollIntervalMs: number;
	maxLevel: number;
	maxCharactersPerUser: number;
	dataFile: string;
}

function required(name: string): string {
	const value = process.env[name]?.trim();
	if (!value) {
		throw new Error(`Missing required environment variable ${name} (see .env.example)`);
	}
	return value;
}

function optional(name: string): string | undefined {
	const value = process.env[name]?.trim();
	return value ? value : undefined;
}

function positiveNumber(name: string, fallback: number): number {
	const raw = optional(name);
	if (raw === undefined) return fallback;
	const value = Number(raw);
	if (!Number.isFinite(value) || value <= 0) {
		throw new Error(`${name} must be a positive number, got "${raw}"`);
	}
	return value;
}

export function loadConfig(): Config {
	return {
		discordToken: required('DISCORD_TOKEN'),
		devGuildId: optional('DEV_GUILD_ID'),
		blizzardClientId: required('BLIZZARD_CLIENT_ID'),
		blizzardClientSecret: required('BLIZZARD_CLIENT_SECRET'),
		defaultRegion: (optional('BLIZZARD_REGION') ?? 'us').toLowerCase(),
		namespace: optional('BLIZZARD_NAMESPACE') ?? 'profile-classic1x',
		locale: optional('BLIZZARD_LOCALE') ?? 'en_US',
		defaultRealm: optional('DEFAULT_REALM'),
		pollIntervalMs: positiveNumber('POLL_INTERVAL_MINUTES', 5) * 60_000,
		maxLevel: positiveNumber('MAX_LEVEL', 60),
		maxCharactersPerUser: positiveNumber('MAX_CHARACTERS_PER_USER', 10),
		dataFile: optional('DATA_FILE') ?? './data/state.json',
	};
}
