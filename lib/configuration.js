"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = void 0;
const envalid_1 = require("envalid");
exports.configs = (0, envalid_1.cleanEnv)(process.env, {
    FBB_BOT_SECRET: (0, envalid_1.str)(),
    FBB_BOT_CLIENT_ID: (0, envalid_1.str)(),
    FBB_BOT_TOKEN: (0, envalid_1.str)(),
    NODE_ENV: (0, envalid_1.str)({ choices: ['development', 'test', 'production', 'staging'] }),
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlndXJhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb25maWd1cmF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUFBLHFDQUF3QztBQUUzQixRQUFBLE9BQU8sR0FBRyxJQUFBLGtCQUFRLEVBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRTtJQUM1QyxjQUFjLEVBQUUsSUFBQSxhQUFHLEdBQUU7SUFDckIsaUJBQWlCLEVBQUUsSUFBQSxhQUFHLEdBQUU7SUFDeEIsYUFBYSxFQUFFLElBQUEsYUFBRyxHQUFFO0lBQ3BCLFFBQVEsRUFBRSxJQUFBLGFBQUcsRUFBQyxFQUFFLE9BQU8sRUFBRSxDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsQ0FBQyxFQUFFLENBQUM7Q0FDNUUsQ0FBQyxDQUFDIn0=