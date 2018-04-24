"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const validation_1 = require("../src/utilities/validation");
describe('Input validation', () => {
    it('is valid url', () => {
        const url = 'http://github.com';
        const result = validation_1.Validation.isUrl(url);
        chai_1.expect(result).to.be.true;
    });
    it('is valid number of connections', () => {
        const numOfConnections = 1;
        const result = validation_1.Validation.isValidNumberOfConnections(numOfConnections);
        chai_1.expect(result).to.be.true;
    });
    it('is invalid number of connections', () => {
        const numOfConnections = 0;
        const result = validation_1.Validation.isValidNumberOfConnections(numOfConnections);
        chai_1.expect(result).to.not.be.true;
    });
    it('is valid directory', () => {
        const directory = __dirname;
        const result = validation_1.Validation.isDirectory(directory);
        chai_1.expect(result).to.be.true;
    });
    it('is invalid directory', () => {
        const directory = '/invalid/directory';
        const result = validation_1.Validation.isDirectory(directory);
        chai_1.expect(result).to.not.be.true;
    });
    it('is valid file name', () => {
        const fileName = 'grumpy_cat.jpg';
        const result = validation_1.Validation.isValidFileName(fileName);
        chai_1.expect(result).to.be.true;
    });
    it('is invalid file name', () => {
        const fileName = 'grumpy*cat.jpg';
        const result = validation_1.Validation.isValidFileName(fileName);
        chai_1.expect(result).to.not.be.true;
    });
});
