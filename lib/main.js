"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const configuration_1 = require("./configuration");
// Create a new client instance
const client = new discord_js_1.Client({ intents: [discord_js_1.Intents.FLAGS.GUILDS] });
// When the client is ready, run this code (only once)
client.once('ready', () => {
    console.log('Ready!');
});
// Login to Discord with your client's token
client.login(configuration_1.configs.FBB_BOT_TOKEN);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMkNBQTZDO0FBQzdDLG1EQUEwQztBQUUxQywrQkFBK0I7QUFDL0IsTUFBTSxNQUFNLEdBQUcsSUFBSSxtQkFBTSxDQUFDLEVBQUUsT0FBTyxFQUFFLENBQUMsb0JBQU8sQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRS9ELHNEQUFzRDtBQUN0RCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLEVBQUU7SUFDekIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQztBQUVILDRDQUE0QztBQUM1QyxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUFPLENBQUMsYUFBYSxDQUFDLENBQUMifQ==