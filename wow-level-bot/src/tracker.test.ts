import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import type { CharacterInfo, CharacterProvider } from './blizzard.js';
import { toRealmSlug } from './blizzard.js';
import { Store, type TrackedCharacter } from './store.js';
import { Tracker } from './tracker.js';

class FakeProvider implements CharacterProvider {
	levels = new Map<string, number>();
	failing = new Set<string>();
	async getCharacter(_region: string, _realm: string, nameKey: string): Promise<CharacterInfo | null> {
		if (this.failing.has(nameKey)) throw new Error('boom');
		const level = this.levels.get(nameKey);
		return level === undefined ? null : { name: nameKey, realmName: 'Realm', level, className: 'Mage' };
	}
}

function character(nameKey: string, level: number, guildId = 'g1'): TrackedCharacter {
	return {
		guildId,
		ownerId: 'u1',
		region: 'us',
		realmSlug: 'realm',
		nameKey,
		displayName: nameKey,
		realmName: 'Realm',
		level,
		addedAt: new Date().toISOString(),
	};
}

async function setup(chars: TrackedCharacter[]) {
	const store = new Store(join(mkdtempSync(join(tmpdir(), 'wow-bot-')), 'state.json'));
	for (const c of chars) await store.add(c);
	const provider = new FakeProvider();
	const announcements: { guildId: string; message: string }[] = [];
	const tracker = new Tracker(store, provider, async (guildId, message) => {
		announcements.push({ guildId, message });
	}, { maxLevel: 60 });
	return { store, provider, announcements, tracker };
}

test('announces a single level up and stores the new level', async () => {
	const { store, provider, announcements, tracker } = await setup([character('thrall', 10)]);
	provider.levels.set('thrall', 11);
	await tracker.checkAll();
	assert.equal(announcements.length, 1);
	assert.match(announcements[0].message, /just hit \*\*level 11\*\*/);
	assert.match(announcements[0].message, /<@u1>/);
	assert.equal(store.allCharacters()[0].level, 11);

	// No change -> no announcement.
	await tracker.checkAll();
	assert.equal(announcements.length, 1);
});

test('announces multi-level jumps and max level specially', async () => {
	const { provider, announcements, tracker } = await setup([character('a', 10), character('b', 59)]);
	provider.levels.set('a', 13);
	provider.levels.set('b', 60);
	await tracker.checkAll();
	assert.match(announcements[0].message, /from level 10 to \*\*level 13\*\*/);
	assert.match(announcements[1].message, /max level 60/);
});

test('does not announce when level is unchanged, lower, missing, or the lookup fails', async () => {
	const { store, provider, announcements, tracker } = await setup([
		character('same', 20),
		character('lower', 20),
		character('gone', 20),
		character('broken', 20),
		character('ok', 20),
	]);
	provider.levels.set('same', 20);
	provider.levels.set('lower', 1);
	provider.failing.add('broken');
	provider.levels.set('ok', 21);
	await tracker.checkAll();
	assert.equal(announcements.length, 1, 'one failure must not stop the rest of the roster');
	assert.match(announcements[0].message, /ok/);
	assert.equal(store.allCharacters().find((c) => c.nameKey === 'gone')?.level, 20);
});

test('store survives a reload from disk', async () => {
	const file = join(mkdtempSync(join(tmpdir(), 'wow-bot-')), 'nested', 'state.json');
	const store = new Store(file);
	await store.add(character('jaina', 42));
	await store.setAnnounceChannel('g1', 'c1');
	const reloaded = new Store(file);
	assert.equal(reloaded.allCharacters()[0].level, 42);
	assert.equal(reloaded.getGuild('g1').announceChannelId, 'c1');
});

test('realm slugs match Blizzard format', () => {
	assert.equal(toRealmSlug('Living Flame'), 'living-flame');
	assert.equal(toRealmSlug("Zul'jin"), 'zuljin');
	assert.equal(toRealmSlug('  Mankrik '), 'mankrik');
});
