"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secrets_json_1 = require("secrets.json");
const util_1 = require("util");
const format_1 = require("support/format");
const evalCommand = (opts) => {
    // bring all values into scope for eval
    // eslint-disable-next-line
    const { interaction, member, guild, reply, embed, client, args } = opts;
    if (!isOwner(member)) {
        return reply(embed.errorColor().setTitle('Hahahahah no'));
    }
    const result = eval(args.code);
    if (args.quiet) {
        // TODO: once the public api gets a way to pong, do that
        return;
    }
    embed
        .okColor()
        .setTitle('Evaluated Code')
        .setDescription(format_1.codeBlock(util_1.inspect(result), 'js'));
    return reply(embed);
};
evalCommand.commandName = 'eval';
evalCommand.defaultPermission = false;
evalCommand.description =
    "If you don't know what this does, you shouldn't be using it.";
evalCommand.options = [
    {
        name: 'code',
        type: 'STRING',
        required: true,
        description: 'Code to be run.',
    },
    {
        name: 'quiet',
        type: 'BOOLEAN',
        required: false,
        description: 'Silences output in response.',
    },
];
exports.default = evalCommand;
const isOwner = (member) => member.id === secrets_json_1.OWNER;
