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
exports.getLib = exports.setupLibs = void 0;
const discord_js_1 = require("discord.js");
const path_1 = require("path");
const logger_1 = require("porygon/logger");
const secrets_json_1 = require("secrets.json");
const dev_1 = require("support/dev");
const dir_1 = require("support/dir");
const lib_1 = require("./lib");
/**
 * See ./lib.ts for an explanation of the lib system.
 */
const libs = new discord_js_1.Collection();
let testLib;
async function setupLibs(client) {
    const promises = Array.from(eachLibDir()).map(async (dir) => {
        logger_1.logger.info(`Setting up ${path_1.basename(dir)}...`);
        const lib = await createLibForDir(client, dir);
        const setup = await getLibSetupCallback(dir);
        if (lib) {
            await (setup === null || setup === void 0 ? void 0 : setup(lib, client));
            libs.set(lib.guildId, lib);
        }
    });
    await Promise.all(promises);
}
exports.setupLibs = setupLibs;
function getLib(guildId) {
    return libs.get(guildId);
}
exports.getLib = getLib;
async function createLibForDir(client, dir) {
    const config = await Promise.resolve().then(() => __importStar(require(`${dir}/lib.json`))).catch(() => {
        logger_1.logger.error(`${path_1.basename(dir)} must have a lib.json file that exports a guildId property.`);
    });
    if (dev_1.isDev) {
        if (typeof testLib === 'undefined') {
            testLib = new lib_1.Lib(client, secrets_json_1.TEST_SERVER);
        }
        return testLib;
    }
    return new lib_1.Lib(client, config.guildId);
}
async function getLibSetupCallback(dir) {
    const mod = await Promise.resolve().then(() => __importStar(require(`${dir}/index.${dev_1.chooseIfDev('js', 'ts')}`))).catch(() => {
        logger_1.logger.warn(`${path_1.basename(dir)} has no index.ts.`);
    });
    if (typeof (mod === null || mod === void 0 ? void 0 : mod.default) !== 'function') {
        logger_1.logger.warn(`${path_1.basename(dir)}'s setup function is not a function, it's ${mod === null || mod === void 0 ? void 0 : mod.default}`);
        return;
    }
    return mod === null || mod === void 0 ? void 0 : mod.default;
}
function* eachLibDir() {
    for (const dir of dir_1.eachDirectory(__dirname)) {
        if (path_1.basename(dir).match(/^lib_/)) {
            yield dir;
        }
    }
}
