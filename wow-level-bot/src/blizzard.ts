export interface CharacterInfo {
	name: string;
	realmName: string;
	level: number;
	className?: string;
}

/** Anything that can look up a character's current level. */
export interface CharacterProvider {
	/** Returns null when the character doesn't exist (or its profile is hidden). */
	getCharacter(region: string, realmSlug: string, nameKey: string): Promise<CharacterInfo | null>;
}

export interface BlizzardOptions {
	clientId: string;
	clientSecret: string;
	/** Namespace without the region suffix, e.g. "profile-classic1x". */
	namespace: string;
	locale: string;
}

interface ProfileResponse {
	name: string;
	level: number;
	realm?: { name?: string };
	character_class?: { name?: string };
}

/**
 * Battle.net Profile API client.
 * Docs: https://develop.battle.net/documentation/world-of-warcraft-classic/profile-apis
 *
 * When Blizzard publishes the WoW Forever endpoints, this is the only file that
 * should need to change (plus BLIZZARD_NAMESPACE in .env).
 */
export class BlizzardClient implements CharacterProvider {
	private token?: { value: string; expiresAt: number };

	constructor(private readonly options: BlizzardOptions) {}

	async getCharacter(region: string, realmSlug: string, nameKey: string): Promise<CharacterInfo | null> {
		const url = new URL(
			`https://${region}.api.blizzard.com/profile/wow/character/` +
				`${encodeURIComponent(realmSlug)}/${encodeURIComponent(nameKey)}`,
		);
		url.searchParams.set('namespace', `${this.options.namespace}-${region}`);
		url.searchParams.set('locale', this.options.locale);

		let res = await fetch(url, { headers: { Authorization: `Bearer ${await this.getToken()}` } });
		if (res.status === 401) {
			// Token was revoked or expired early; refresh once.
			this.token = undefined;
			res = await fetch(url, { headers: { Authorization: `Bearer ${await this.getToken()}` } });
		}
		if (res.status === 404) return null;
		if (!res.ok) {
			throw new Error(`Blizzard API ${res.status} for ${region}/${realmSlug}/${nameKey}`);
		}

		const body = (await res.json()) as ProfileResponse;
		return {
			name: body.name,
			level: body.level,
			realmName: body.realm?.name ?? realmSlug,
			className: body.character_class?.name,
		};
	}

	private async getToken(): Promise<string> {
		if (this.token && Date.now() < this.token.expiresAt) return this.token.value;

		const basic = Buffer.from(`${this.options.clientId}:${this.options.clientSecret}`).toString('base64');
		const res = await fetch('https://oauth.battle.net/token', {
			method: 'POST',
			headers: {
				Authorization: `Basic ${basic}`,
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: 'grant_type=client_credentials',
		});
		if (!res.ok) {
			throw new Error(`Battle.net token request failed: ${res.status} ${await res.text()}`);
		}
		const body = (await res.json()) as { access_token: string; expires_in: number };
		// Refresh a minute before it actually expires.
		this.token = { value: body.access_token, expiresAt: Date.now() + (body.expires_in - 60) * 1000 };
		return this.token.value;
	}
}

/** "Mankrik" -> "mankrik", "Living Flame" -> "living-flame", "Zul'jin" -> "zuljin". */
export function toRealmSlug(realm: string): string {
	return realm
		.trim()
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/\s+/g, '-');
}
