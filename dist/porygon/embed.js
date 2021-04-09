"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PorygonEmbed = void 0;
const discord_js_1 = require("discord.js");
const asset_1 = require("./asset");
const colors_json_1 = __importDefault(require("./colors.json"));
class PorygonEmbed extends discord_js_1.MessageEmbed {
    poryPortrait() {
        return this.setThumbnail(asset_1.PORY_PORTRAIT);
    }
    okColor() {
        return this.setColor(colors_json_1.default.ok);
    }
    infoColor() {
        return this.setColor(colors_json_1.default.info);
    }
    errorColor() {
        return this.setColor(colors_json_1.default.error);
    }
    warningColor() {
        return this.setColor(colors_json_1.default.warning);
    }
    addInlineField(name, value) {
        return this.addField(name, value, true);
    }
}
exports.PorygonEmbed = PorygonEmbed;
