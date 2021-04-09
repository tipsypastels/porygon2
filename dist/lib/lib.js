"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lib = void 0;
const lib_commands_1 = require("./lib_commands");
/**
 * A "lib" represents a block of behavior, including handlers and commands, that
 * are unique to a particular guild. This is used to easily compartmentalize
 * server-specific functionality.
 *
 * Every lib must have:
 * - a directory name matching `/^lib_/`
 * - a `lib.json` file with, at minimum, a `guildId` key
 * - an `index.ts` file that exports a setup callback
 *
 * Assuming conditions are met, an instance of this class will be created and
 * passed to each setup callback automatically.
 */
class Lib {
    constructor(client, guildId) {
        this.client = client;
        this.guildId = guildId;
        this.commands = new lib_commands_1.LibCommands(this);
    }
    async importCommands(dir, { global = false } = {}) {
        await this.commands.import(dir, { global });
    }
    async importHandlers(dir) {
        /* TODO */
    }
}
exports.Lib = Lib;
