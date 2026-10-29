// Registers the /blog slash command with Discord. Run once, and again after
// editing lib/blog-bot/command.json:
//
//   DISCORD_APP_ID=... DISCORD_BOT_TOKEN=... [DISCORD_GUILD_ID=...] node scripts/register-discord-commands.mjs
//
// With DISCORD_GUILD_ID the command appears in that server immediately;
// without it the command is global and can take up to an hour to show up.
import { readFileSync } from 'node:fs';

const { DISCORD_APP_ID: appId, DISCORD_BOT_TOKEN: botToken, DISCORD_GUILD_ID: guildId } = process.env;
if (!appId || !botToken) {
  console.error('Set DISCORD_APP_ID and DISCORD_BOT_TOKEN (and optionally DISCORD_GUILD_ID).');
  process.exit(1);
}

const command = JSON.parse(readFileSync(new URL('../lib/blog-bot/command.json', import.meta.url), 'utf8'));
const url = guildId
  ? `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`
  : `https://discord.com/api/v10/applications/${appId}/commands`;

// PUT replaces the whole command set, so a removed command disappears too
const res = await fetch(url, {
  method: 'PUT',
  headers: { Authorization: `Bot ${botToken}`, 'Content-Type': 'application/json' },
  body: JSON.stringify([command]),
});

if (!res.ok) {
  console.error(`Discord said ${res.status}:`, await res.text());
  process.exit(1);
}
const [registered] = await res.json();
console.log(`Registered /${registered.name} (${registered.id}) ${guildId ? `in guild ${guildId}` : 'globally'}.`);
