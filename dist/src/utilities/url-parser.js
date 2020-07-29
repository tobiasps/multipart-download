"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UrlParser = void 0;
const url = require("url");
class UrlParser {
    static getFilename(fileUrl) {
        const parsedUrl = url.parse(fileUrl);
        const filename = new RegExp(/(?:\/.+)?\/(.+)/, '').exec(parsedUrl.path);
        return filename[1];
    }
}
exports.UrlParser = UrlParser;
