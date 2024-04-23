import { createRequire } from "module";
const require = createRequire(import.meta.url);

export const headers = require("./config/headers.json");

export const templates = require("./config/templates.json");

export const URLs = require("./config/URLs.json");
