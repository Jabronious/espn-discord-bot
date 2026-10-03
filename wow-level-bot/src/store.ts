import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface TrackedCharacter {
	guildId: string;
	ownerId: string;
	region: string;
	realmSlug: string;
	/** Lowercased name used for lookups. */
	nameKey: string;
	/** Name as returned by the API, for display. */
	displayName: string;
	realmName: string;
	className?: string;
	level: number;
	addedAt: string;
	lastCheckedAt?: string;
}

export interface GuildSettings {
	announceChannelId?: string;
}

interface State {
	guilds: Record<string, GuildSettings>;
	characters: TrackedCharacter[];
}

export function characterKey(c: Pick<TrackedCharacter, 'guildId' | 'region' | 'realmSlug' | 'nameKey'>): string {
	return [c.guildId, c.region, c.realmSlug, c.nameKey].join('/');
}

/**
 * Tiny JSON-file store. Plenty for a few hundred characters, and has no native
 * dependencies so it installs cleanly on a Raspberry Pi.
 */
export class Store {
	private state: State;
	private writeChain: Promise<void> = Promise.resolve();

	constructor(private readonly file: string) {
		this.state = existsSync(file)
			? (JSON.parse(readFileSync(file, 'utf8')) as State)
			: { guilds: {}, characters: [] };
		this.state.guilds ??= {};
		this.state.characters ??= [];
	}

	getGuild(guildId: string): GuildSettings {
		return this.state.guilds[guildId] ?? {};
	}

	async setAnnounceChannel(guildId: string, channelId: string): Promise<void> {
		this.state.guilds[guildId] = { ...this.getGuild(guildId), announceChannelId: channelId };
		await this.save();
	}

	allCharacters(): TrackedCharacter[] {
		return [...this.state.characters];
	}

	guildCharacters(guildId: string): TrackedCharacter[] {
		return this.state.characters.filter((c) => c.guildId === guildId);
	}

	find(key: string): TrackedCharacter | undefined {
		return this.state.characters.find((c) => characterKey(c) === key);
	}

	async add(character: TrackedCharacter): Promise<void> {
		this.state.characters.push(character);
		await this.save();
	}

	async remove(key: string): Promise<boolean> {
		const before = this.state.characters.length;
		this.state.characters = this.state.characters.filter((c) => characterKey(c) !== key);
		if (this.state.characters.length === before) return false;
		await this.save();
		return true;
	}

	async update(key: string, changes: Partial<TrackedCharacter>): Promise<void> {
		const existing = this.find(key);
		if (!existing) return;
		Object.assign(existing, changes);
		await this.save();
	}

	/** Writes are serialized and atomic (write temp file, then rename). */
	private save(): Promise<void> {
		const snapshot = JSON.stringify(this.state, null, 2);
		this.writeChain = this.writeChain
			.catch(() => undefined)
			.then(async () => {
				mkdirSync(dirname(this.file), { recursive: true });
				const tmp = `${this.file}.tmp`;
				await writeFile(tmp, snapshot);
				await rename(tmp, this.file);
			});
		return this.writeChain;
	}
}
