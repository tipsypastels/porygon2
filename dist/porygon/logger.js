"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const dev_1 = require("support/dev");
const winston_1 = require("winston");
exports.logger = winston_1.createLogger({
    level: 'info',
    format: winston_1.format.json(),
    transports: [
        new winston_1.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.transports.File({ filename: 'combined.log' }),
    ],
});
if (dev_1.isDev) {
    exports.logger.add(new winston_1.transports.Console({
        format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
        level: 'debug',
    }));
}
