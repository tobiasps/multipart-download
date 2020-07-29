"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validation = void 0;
const fs = require("fs");
const validator = require("validator");
const validFilename = require("valid-filename");
class Validation {
    static isUrl(url) {
        return validator.isURL(url);
    }
    static isValidNumberOfConnections(numOfConnections) {
        const isValid = numOfConnections > 0;
        return isValid;
    }
    static isDirectory(directory) {
        let isDirectory;
        try {
            const stat = fs.lstatSync(directory);
            isDirectory = stat.isDirectory();
        }
        catch (err) {
            isDirectory = false;
        }
        return isDirectory;
    }
    static isValidFileName(fileName) {
        return validFilename(fileName);
    }
}
exports.Validation = Validation;
