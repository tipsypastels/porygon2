"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function duck(lib) {
    await lib.importCommands(`${__dirname}/commands`);
}
exports.default = duck;
