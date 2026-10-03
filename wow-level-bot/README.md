# WoW Level Bot

A small Discord bot that announces in your server when tracked World of Warcraft
characters level up. Players add their own characters with a slash command. The bot
checks the Blizzard API every few minutes and posts something like:

> 🎉 @you's **Thrall** (Warrior) on Living Flame just hit **level 42**!

It's built to run on a Raspberry Pi 3. It has no database and no native dependencies.
Everything is saved to one JSON file.

## Commands

| Command | Who | What it does |
| --- | --- | --- |
| `/wow track name [realm] [region]` | anyone | Start tracking your character. The first character added sets the announcement channel to the channel the command was run in. |
| `/wow untrack name [realm] [region]` | owner or Manage Server | Stop tracking a character. |
| `/wow list` | anyone | Show every tracked character in the server, highest level first. |
| `/wow channel [channel]` | Manage Server | Change where level ups are announced. |

## About WoW Forever

*WoW: Forever* launches on **November 4, 2026**. Blizzard hasn't published its API
endpoints yet. Until then, point the bot at a game version that already has an API so
you can test it end to end:

- `BLIZZARD_NAMESPACE=profile-classic1x` for Classic Era, Hardcore and Anniversary era realms
- `BLIZZARD_NAMESPACE=profile-classic` for Classic progression realms

When the Forever API goes live, change `BLIZZARD_NAMESPACE` to its namespace. Forever has
no realms, so set `DEFAULT_REALM` and players can leave out `realm`. If Blizzard also
changes the URL shape, the only file to update is `src/blizzard.ts`.

## Setup

### 1. Create the Discord bot

1. Go to <https://discord.com/developers/applications>, click **New Application**, then open **Bot**.
2. Click **Reset Token** and copy the token. This is `DISCORD_TOKEN`.
3. No privileged intents are needed.
4. Under **OAuth2 → URL Generator**, tick the scopes `bot` and `applications.commands`, and
   the permissions **View Channels** and **Send Messages**. Open the generated URL to
   invite the bot to your server.

### 2. Get Blizzard API credentials

1. Go to <https://develop.battle.net/access/clients> and click **Create Client**.
2. Copy the Client ID and Secret into `BLIZZARD_CLIENT_ID` and `BLIZZARD_CLIENT_SECRET`.

### 3. Run locally (optional)

```bash
cp .env.example .env   # fill it in
npm install
npm run build
npm start
```

Set `DEV_GUILD_ID` to your server's ID while testing. Commands then register to that
server instantly instead of globally.

## Deploying to a Raspberry Pi 3

Use **Raspberry Pi OS Lite (64-bit)**. The Pi 3 supports it, and current Node.js
releases ship arm64 builds.

```bash
# On the Pi: install Node.js 22 LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs git

# Get the code
git clone https://github.com/Jabronious/espn-discord-bot.git
cp -r espn-discord-bot/wow-level-bot ~/wow-level-bot
cd ~/wow-level-bot

# Configure, install, build
cp .env.example .env && nano .env
npm ci
npm run build

# Run on boot and restart if it crashes
sudo cp deploy/wow-level-bot.service /etc/systemd/system/
# Change User= / WorkingDirectory= in the unit if your username isn't "pi"
sudo systemctl daemon-reload
sudo systemctl enable --now wow-level-bot

# Logs
journalctl -u wow-level-bot -f
```

To update later: `git pull`, copy the folder again, then run `npm ci && npm run build`
and `sudo systemctl restart wow-level-bot`.

Tracked characters live in `data/state.json`. Back up that file to keep your roster.

## Configuration

See [`.env.example`](.env.example) for every option. The useful ones are:

- `POLL_INTERVAL_MINUTES`: how often to check (default 5). Blizzard allows 36,000
  requests per hour, so even a few hundred characters is fine.
- `MAX_LEVEL`: the level that gets the 🏆 announcement (default 60).
- `MAX_CHARACTERS_PER_USER`: anti-spam cap per person per server (default 10).

## Development

```bash
npm test   # builds, then runs the node:test suite
```

Note: the Blizzard API caches profiles, so a level up can take a few minutes after the
ding to show up.
