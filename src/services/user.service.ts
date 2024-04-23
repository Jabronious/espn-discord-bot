import { User, IUser } from '../models/users.model';

export class UsersService {
	private userModel = User;
	constructor() {}

	async findByDiscordId(discordId: string): Promise<IUser | null> {
		const user = await this.userModel.findOne({ discordId: discordId }).lean();
		return user;
	}
}
