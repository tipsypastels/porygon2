"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const array_1 = require("support/array");
const nudge = async ({ guild, embed, reply }) => {
    embed.okColor().setTitle(disaster()).setDescription(deaths(guild));
    reply(embed);
};
nudge.description = 'Never use this it literally causes natural disasters.';
exports.default = nudge;
function disaster() {
    return array_1.random(DISASTERS);
}
function deaths(guild) {
    const count = Math.min(array_1.random(BASE_COUNT), guild.memberCount);
    const members = guild.members.cache.random(count);
    return `${array_1.toSentence(members)} were killed.`;
}
const BASE_COUNT = array_1.range(3, 7);
const DISASTERS = [
    'Buildings crumble',
    'Earthquakes makin their way downtown ziggin fast',
    'Cookies crumble',
    'Groudon: Emerges',
    'A Porytude 7 earthquake!',
    'Just imagine Discord shaking',
    'Cars tumble down the roads',
    'Earthquakes are uncomf',
    'Hundreds of books drop from the shelves',
    'All the chairs roll away',
    'Vases fall and shatter',
    'A glass of water spills',
    'A plant falls over leaving dirt everywhere',
    'Random ceiling tiles fall down',
    'The floor shakes and cracks',
];
