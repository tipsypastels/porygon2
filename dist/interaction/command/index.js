"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeCommandHandler = void 0;
function removeCommandHandler(command) {
    var _a;
    return Object.assign(Object.assign({}, command), { name: (_a = command.commandName) !== null && _a !== void 0 ? _a : command.name });
}
exports.removeCommandHandler = removeCommandHandler;
