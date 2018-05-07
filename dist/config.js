"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config = {
    "port": 4000,
    "root": "./static",
    "cache": {
        "file": /(jpg|jpeg|png|gif|css|js)/i,
        "maxAge": 60 * 60 * 24 * 365,
    },
};
exports.default = config;
