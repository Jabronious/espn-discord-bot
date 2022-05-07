"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const builders_1 = require("@discordjs/builders");
const rest_1 = require("@discordjs/rest");
const v9_1 = require("discord-api-types/v9");
const configuration_1 = require("./configuration");
const commands = [
    new builders_1.SlashCommandBuilder().setName('ping').setDescription('Replies with pong!'),
    new builders_1.SlashCommandBuilder().setName('server').setDescription('Replies with server info!'),
    new builders_1.SlashCommandBuilder().setName('user').setDescription('Replies with user info!'),
].map((command) => command.toJSON());
const rest = new rest_1.REST({ version: '9' }).setToken(configuration_1.configs.FBB_BOT_TOKEN);
rest.put(v9_1.Routes.applicationGuildCommands(configuration_1.configs.FBB_BOT_CLIENT_ID, '827907164780756992'), { body: commands })
    .then(() => console.log('Successfully registered application commands.'))
    .catch(console.error);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWFuZHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29tbWFuZHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxrREFBMEQ7QUFDMUQsMENBQXVDO0FBQ3ZDLDZDQUE4QztBQUM5QyxtREFBMEM7QUFFMUMsTUFBTSxRQUFRLEdBQUc7SUFDaEIsSUFBSSw4QkFBbUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMsb0JBQW9CLENBQUM7SUFDOUUsSUFBSSw4QkFBbUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxjQUFjLENBQUMsMkJBQTJCLENBQUM7SUFDdkYsSUFBSSw4QkFBbUIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxjQUFjLENBQUMseUJBQXlCLENBQUM7Q0FDbkYsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0FBRXJDLE1BQU0sSUFBSSxHQUFHLElBQUksV0FBSSxDQUFDLEVBQUUsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLENBQUMsUUFBUSxDQUFDLHVCQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFFeEUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFNLENBQUMsd0JBQXdCLENBQUMsdUJBQU8sQ0FBQyxpQkFBaUIsRUFBRSxvQkFBb0IsQ0FBQyxFQUFFLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxDQUFDO0tBQzVHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLCtDQUErQyxDQUFDLENBQUM7S0FDeEUsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyJ9