import { bool, cleanEnv, str } from 'envalid';

function subdomain(): string {
	if (process.env.NODE_ENV === 'staging') {
		return 'staging.';
	} else if (process.env.NODE_ENV === 'production') {
		return '';
	} else {
		return 'develop.';
	}
}

function isLocal(): boolean {
	return process.env.NODE_ENV === 'local';
}

export const configs = cleanEnv(process.env, {
	FBB_BOT_SECRET: str(),
	FBB_BOT_CLIENT_ID: str(),
	FBB_BOT_TOKEN: str(),
	COSMOS_CONNECTION_STRING: str({ devDefault: 'change-me' }),
	NODE_ENV: str({ choices: ['local', 'development', 'test', 'production', 'staging'], default: 'local' }),
	SUBDOMAIN: str({ default: subdomain() }),
	AZURE_TENANT_ID: str(),
	AZURE_CLIENT_ID: str(),
	AZURE_CLIENT_SECRET: str(),
	KEY_VAULT_URL: str(),
	KEY_NAME: str({ default: 'espn-discord-bot-key' }),
	isLocal: bool({ default: isLocal() }),
});
