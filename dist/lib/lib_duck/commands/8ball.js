"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("support/array");
const eightBall = ({ embed, reply }) => {
    const line = array_1.random(LINES);
    embed
        .infoColor()
        .poryPortrait()
        .setTitle('The wise oracle Porygon studies her magic 8-ball.')
        .setDescription(line);
    reply(embed);
};
eightBall.commandName = '8ball';
eightBall.description = 'Asks a question of the wise oracle Porygon.';
eightBall.options = [
    {
        name: 'question',
        type: 'STRING',
        required: true,
        description: 'The question you would ask the wise oracle Porygon.',
    },
];
exports.default = eightBall;
const LINES = [
    'As I see it, yes.',
    'Ask again later.',
    'Better not tell you now.',
    'Cannot predict now.',
    'Concentrate and ask again.',
    'Don’t count on it.',
    'It is certain.',
    'It is decidedly so.',
    'Most likely.',
    'My reply is no.',
    'My sources say no.',
    'Outlook not so good.',
    'Outlook good.',
    'Reply hazy, try again.',
    'Signs point to yes.',
    'Very doubtful.',
    'Without a doubt.',
    'Yes.',
    'Yes – definitely.',
    'You may rely on it.',
];
