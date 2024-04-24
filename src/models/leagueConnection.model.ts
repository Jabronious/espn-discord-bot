import { Schema, model } from 'mongoose';

export interface ILeagueConnection {
	discordChannelId: String;
	leagueId: String;
}

const leagueConnectionSchema = new Schema<ILeagueConnection>({
	discordChannelId: String,
	leagueId: String,
});

export const LeagueConnection = model<ILeagueConnection>('LeagueConnection', leagueConnectionSchema);
