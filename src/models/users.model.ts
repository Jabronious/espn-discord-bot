import { Schema, model } from 'mongoose';

export interface IUser {
	username: String;
	discriminator: String;
	espn_s2: String;
	swid: String;
	discordId: String;
}

const userSchema = new Schema<IUser>({
	username: String,
	discriminator: String,
	espn_s2: String,
	swid: String,
	discordId: String,
});

export const User = model<IUser>('User', userSchema);
