"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = void 0;
const embed_1 = require("porygon/embed");
const args_1 = require("./args");
async function runCommand({ client, command, interaction, }) {
    const args = args_1.createCommandArgs(interaction);
    await command({
        client,
        interaction,
        args,
        reply: interaction.reply.bind(interaction),
        guild: interaction.guild,
        member: interaction.member,
        embed: new embed_1.PorygonEmbed(),
    });
}
exports.runCommand = runCommand;
