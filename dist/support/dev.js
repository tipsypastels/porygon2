"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chooseIfDev = exports.isDev = void 0;
/**
 * Shorthand for whether development mode is enabled.
 */
exports.isDev = process.env.NODE_ENV === 'development';
/**
 * Returns `prod` if production, `dev` is development. Quick and easy way
 * to do a binary choice.
 */
const chooseIfDev = (prod, dev) => (exports.isDev ? dev : prod);
exports.chooseIfDev = chooseIfDev;
