"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const url_parser_1 = require("../src/utilities/url-parser");
describe('Url parser', () => {
    it('get filename from url', () => {
        const filename = 'cat.png';
        const result = url_parser_1.UrlParser.getFilename('https://homepages.cae.wisc.edu/~ece533/images/cat.png');
        chai_1.expect(result).to.equal(filename);
    });
});
