"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDirectory = exports.eachDirectory = exports.eachFileRecursive = exports.eachFile = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
/**
 * Yields each file in a directory to an iterator.
 */
function* eachFile(dir) {
    yield* eachInternal(dir, { onFile: 'yield', onDir: 'ignore' });
}
exports.eachFile = eachFile;
/**
 * Same as `eachFile`, but will recurse directories.
 */
function* eachFileRecursive(dir) {
    yield* eachInternal(dir, { onFile: 'yield', onDir: 'yield*' });
}
exports.eachFileRecursive = eachFileRecursive;
/**
 * Yields each sub-directory in a directory to an interator.
 * Ignores other files in the directory.
 */
function* eachDirectory(dir) {
    yield* eachInternal(dir, { onFile: 'ignore', onDir: 'yield' });
}
exports.eachDirectory = eachDirectory;
/**
 * Returns whether the path is a directory.
 */
function isDirectory(path) {
    return fs_1.statSync(path).isDirectory();
}
exports.isDirectory = isDirectory;
function* eachInternal(dir, { onFile, onDir }) {
    for (const file of fs_1.readdirSync(dir)) {
        const path = path_1.join(dir, file);
        if (isDirectory(path)) {
            switch (onDir) {
                case 'yield':
                    yield path;
                    break;
                case 'yield*':
                    yield* eachInternal(path, { onFile, onDir });
                    break;
            }
        }
        else if (onFile === 'yield') {
            yield path_1.relative(__dirname, path);
        }
    }
}
