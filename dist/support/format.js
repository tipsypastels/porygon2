"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeBlock = exports.code = exports.italics = exports.bold = void 0;
/**
 * Converts a string to markdown bold.
 */
function bold(value) {
    return `**${value}**`;
}
exports.bold = bold;
/**
 * Converts a string to markdown italics.
 */
function italics(value) {
    return `_${value}_`;
}
exports.italics = italics;
/**
 * Converts a string to inline-code.
 */
function code(value) {
    return `\`${value}\``;
}
exports.code = code;
/**
 * Converts a string to a code block, optionally with a provided language.
 */
function codeBlock(value, language) {
    return `\`\`\`${language}\n${value}\`\`\``;
}
exports.codeBlock = codeBlock;
