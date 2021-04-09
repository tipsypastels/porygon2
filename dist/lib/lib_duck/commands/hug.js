"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("support/array");
const hug = ({ args, embed, reply }) => {
    const { displayName } = args.member;
    const stat = array_1.random(STATS);
    embed
        .okColor()
        .setTitle(`You hug ${displayName}!`)
        .setDescription(`:hugging: ${displayName}'s ${stat} rose!`);
    reply(embed);
};
hug.description = 'Hugs a friend.';
hug.options = [
    {
        name: 'member',
        type: 'USER',
        description: 'The member to hug.',
        required: true,
    },
];
exports.default = hug;
const STATS = [
    'Attack',
    'Defense',
    'Speed',
    'Special Attack',
    'Special Defense',
    'HP',
];
