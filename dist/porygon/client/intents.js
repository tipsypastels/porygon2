"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.intents = void 0;
const discord_js_1 = require("discord.js");
exports.intents = new discord_js_1.Intents();
exports.intents.add('GUILDS', 'GUILD_BANS', 'GUILD_EMOJIS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_PRESENCES');
