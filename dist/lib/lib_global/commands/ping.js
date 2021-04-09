"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stats_1 = require("porygon/stats");
const ping = ({ interaction, embed }) => {
    embed
        .infoColor()
        .poryPortrait()
        .setTitle(':sparkles: Pong! Porygon is online~')
        .setDescription('_beep boop_ How are you all today?')
        .addField('Uptime', stats_1.uptime.inWords());
    interaction.reply(embed);
};
ping.description = 'Says hi from Porygon.';
exports.default = ping;
