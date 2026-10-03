import type { CharacterProvider } from './blizzard.js';
import { characterKey, type Store, type TrackedCharacter } from './store.js';

export type Announce = (guildId: string, message: string) => Promise<void>;

export interface TrackerOptions {
	maxLevel: number;
	/** Pause between API calls so a big roster doesn't burst the rate limit. */
	delayBetweenRequestsMs?: number;
	log?: (message: string) => void;
}

export function levelUpMessage(c: TrackedCharacter, oldLevel: number, newLevel: number, maxLevel: number): string {
	const who = `<@${c.ownerId}>'s **${c.displayName}**${c.className ? ` (${c.className})` : ''}`;
	if (newLevel >= maxLevel) {
		return `🏆 ${who} on ${c.realmName} has reached **max level ${newLevel}**! Congratulations!`;
	}
	if (newLevel - oldLevel > 1) {
		return `🎉 ${who} on ${c.realmName} jumped from level ${oldLevel} to **level ${newLevel}**!`;
	}
	return `🎉 ${who} on ${c.realmName} just hit **level ${newLevel}**!`;
}

export class Tracker {
	private running = false;

	constructor(
		private readonly store: Store,
		private readonly provider: CharacterProvider,
		private readonly announce: Announce,
		private readonly options: TrackerOptions,
	) {}

	/** Checks every tracked character once. Overlapping calls are skipped. */
	async checkAll(): Promise<void> {
		if (this.running) return;
		this.running = true;
		try {
			for (const c of this.store.allCharacters()) {
				await this.checkOne(c);
				if (this.options.delayBetweenRequestsMs) {
					await new Promise((r) => setTimeout(r, this.options.delayBetweenRequestsMs));
				}
			}
		} finally {
			this.running = false;
		}
	}

	private async checkOne(c: TrackedCharacter): Promise<void> {
		const key = characterKey(c);
		try {
			const info = await this.provider.getCharacter(c.region, c.realmSlug, c.nameKey);
			const now = new Date().toISOString();
			if (!info) {
				this.options.log?.(`Character not found (renamed, deleted or hidden?): ${key}`);
				await this.store.update(key, { lastCheckedAt: now });
				return;
			}
			// Character may have been untracked while we were waiting on the API.
			if (!this.store.find(key)) return;

			const oldLevel = c.level;
			await this.store.update(key, {
				level: info.level,
				displayName: info.name,
				realmName: info.realmName,
				className: info.className ?? c.className,
				lastCheckedAt: now,
			});
			if (info.level > oldLevel) {
				const updated = this.store.find(key) ?? c;
				await this.announce(c.guildId, levelUpMessage(updated, oldLevel, info.level, this.options.maxLevel));
			}
		} catch (err) {
			this.options.log?.(`Failed to check ${key}: ${(err as Error).message}`);
		}
	}
}
