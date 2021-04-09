"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const math_1 = require("porygon/math");
const format_1 = require("support/format");
const calc = async ({ args, embed, reply }) => {
    try {
        const result = await math_1.evaluate(args.equation);
        embed
            .infoColor()
            .setTitle('Aaaand the answer is...')
            .setDescription(format_1.codeBlock(result));
    }
    catch (error) {
        embed
            .poryPortrait()
            .warningColor()
            .setDescription(format_1.codeBlock(error.message))
            .setTitle('_Porygon adjusts her glasses and takes another look at that equation._');
    }
    reply(embed);
};
calc.description = 'Does your math homework.';
calc.options = [
    {
        name: 'equation',
        type: 'STRING',
        required: true,
        description: 'An equation to evaluate.',
    },
];
exports.default = calc;
