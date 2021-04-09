"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCommandArgs = void 0;
function createCommandArgs(interaction) {
    const out = {};
    for (const option of interaction.options) {
        switch (option.type) {
            case 'USER': {
                out[option.name] = option.member;
                break;
            }
            case 'CHANNEL': {
                out[option.name] = option.channel;
                break;
            }
            case 'ROLE': {
                out[option.name] = option.role;
                break;
            }
            default: {
                out[option.name] = option.value;
            }
        }
    }
    return out;
}
exports.createCommandArgs = createCommandArgs;
