import { cleanEnv, str } from 'envalid';

export const configs = cleanEnv(process.env, {
	FBB_BOT_SECRET: str(),
	FBB_BOT_CLIENT_ID: str(),
	FBB_BOT_TOKEN: str(),
	COSMOS_CONNECTION_STRING: str({ devDefault: 'change-me' }),
	NODE_ENV: str({ choices: ['development', 'test', 'production', 'staging'], default: 'development' }),
});
