"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const test_config_1 = require("./test-config");
const partial_download_1 = require("../src/models/partial-download");
describe('Partial download', () => {
    it('download a segment of a file', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        let segmentSize = 0;
        new partial_download_1.PartialDownload()
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, { start: 0, end: 199 })
            .on('data', (data, offset) => {
            segmentSize += data.length;
        })
            .on('end', () => {
            chai_1.expect(segmentSize).to.equal(200);
            done();
        });
    });
});
