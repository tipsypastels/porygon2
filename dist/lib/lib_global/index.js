"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = async (lib) => {
    await lib.importCommands(`${__dirname}/commands`, { global: true });
};
