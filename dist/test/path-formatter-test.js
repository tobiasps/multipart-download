"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
const chai_1 = require("chai");
const path_formatter_1 = require("../src/utilities/path-formatter");
describe('Path formatter', () => {
    it('is correct path format', () => {
        const filePath = `${os.tmpdir()}${path.sep}test.txt`;
        const result = path_formatter_1.PathFormatter.format(os.tmpdir(), 'test.txt');
        chai_1.expect(result).to.equal(filePath);
    });
});
