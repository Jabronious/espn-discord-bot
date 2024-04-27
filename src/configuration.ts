import { cleanEnv, str } from 'envalid';

function subdomain() {
	if (process.env.NODE_ENV === 'staging') {
		return 'staging.';
	} else if (process.env.NODE_ENV === 'production') {
		return '';
	} else {
		return 'develop.';
	}
}

export const configs = cleanEnv(process.env, {
	FBB_BOT_SECRET: str(),
	FBB_BOT_CLIENT_ID: str(),
	FBB_BOT_TOKEN: str(),
	COSMOS_CONNECTION_STRING: str({ devDefault: 'change-me' }),
	NODE_ENV: str({ choices: ['local', 'development', 'test', 'production', 'staging'], default: 'development' }),
	SUBDOMAIN: str({ default: subdomain() }),
});
