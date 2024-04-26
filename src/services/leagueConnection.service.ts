import { ILeagueConnection, LeagueConnection } from '../models/leagueConnection.model';

export class LeagueConnectionService {
	private leagueConnectionModel = LeagueConnection;
	constructor() {}

	async createLeagueConnection(discordChannelId: string, leagueId: string): Promise<ILeagueConnection | null> {
		const leagueConnection = await this.leagueConnectionModel.create({
			discordChannelId: discordChannelId,
			leagueId: leagueId,
		});
		return leagueConnection;
	}

	async findByDiscordChannelId(discordChannelId: string): Promise<ILeagueConnection | null> {
		const leagueConnection = await this.leagueConnectionModel
			.findOne({ discordChannelId: discordChannelId })
			.lean();
		return leagueConnection;
	}
}
