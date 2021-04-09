"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LibCommands = void 0;
const discord_js_1 = require("discord.js");
const command_1 = require("interaction/command");
const runtime_1 = require("interaction/command/runtime");
const path_1 = require("path");
const logger_1 = require("porygon/logger");
const dev_1 = require("support/dev");
const dir_1 = require("support/dir");
class LibCommands {
    constructor(lib) {
        this.lib = lib;
    }
    static async handle(client, interaction) {
        const command = this.handlers.get(interaction.commandID);
        if (!command) {
            logger_1.logger.error(`Got an interaction for nonexistant command ${interaction.commandName}.`);
            return;
        }
        await runtime_1.runCommand({
            command,
            interaction,
            client,
        });
    }
    async import(dir, { global = false } = {}) {
        const promises = Array.from(dir_1.eachFileRecursive(dir)).map(async (file) => {
            const mod = await Promise.resolve().then(() => __importStar(require(file)));
            if (!mod || !mod.default || Object.keys(mod.default).length === 0) {
                return logger_1.logger.error(`${path_1.basename(file)} does not have a command default export.`);
            }
            const command = mod.default;
            const id = await this.addRegistration(command, global);
            if (id) {
                await this.addHandler(id, command);
            }
        });
        await Promise.all(promises);
    }
    async addRegistration(command, global) {
        var _a;
        const data = command_1.removeCommandHandler(command);
        let result;
        if (global && !dev_1.isDev) {
            result = (_a = this.client.application) === null || _a === void 0 ? void 0 : _a.commands.create(data);
        }
        else if (this.guild) {
            result = this.guild.commands.create(data);
        }
        if (result) {
            return (await result).id;
        }
    }
    addHandler(id, command) {
        LibCommands.handlers.set(id, command);
    }
    get client() {
        return this.lib.client;
    }
    get guild() {
        return this.client.guilds.cache.get(this.lib.guildId);
    }
}
exports.LibCommands = LibCommands;
LibCommands.handlers = new discord_js_1.Collection();
