"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = exports.Porygon = void 0;
const discord_js_1 = require("discord.js");
const lib_1 = require("lib");
const lib_commands_1 = require("lib/lib_commands");
const intents_1 = require("./client/intents");
const logger_1 = require("./logger");
const stats_1 = require("./stats");
/**
 * The base Porygon class, which is a wrapper around discord.js's `Client`.
 */
class Porygon extends discord_js_1.Client {
    constructor() {
        super({ intents: intents_1.intents });
        this.once('ready', async () => {
            await this.setup();
            logger_1.logger.info('Porygon is ready!');
        });
        this.on('interaction', (interaction) => {
            if (!interaction.guild || !interaction.isCommand()) {
                return;
            }
            lib_commands_1.LibCommands.handle(this, interaction);
        });
    }
    async setup() {
        await Promise.all([this.setupLibs(), this.setupStats()]);
    }
    async setupLibs() {
        await lib_1.setupLibs(this);
    }
    setupStats() {
        stats_1.uptime.startTiming();
    }
}
exports.Porygon = Porygon;
/**
 * The global client singleton.
 *
 * @see Porygon
 */
exports.client = new Porygon();
