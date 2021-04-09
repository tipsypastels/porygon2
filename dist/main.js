"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secrets_json_1 = require("./secrets.json");
const client_1 = require("./porygon/client");
client_1.client.login(secrets_json_1.TOKEN);
