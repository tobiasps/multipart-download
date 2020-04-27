"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const test_config_1 = require("./test-config");
const multipart_download_1 = require("../src/models/multipart-download");
describe('Multipart download', () => {
    it('download with Accept-Ranges header without passing start options', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        let fileContentLengthCounter = 0;
        new multipart_download_1.MultipartDownload()
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', () => {
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            done();
        })
            .on('error', (err) => {
            done(err);
        });
    });
    it('download with Accept-Ranges header with start options', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const options = {
            numOfConnections: 5
        };
        let fileContentLengthCounter = 0;
        new multipart_download_1.MultipartDownload()
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, options)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', () => {
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            done();
        })
            .on('error', (err) => {
            done(err);
        });
    });
    it('download without Accept-Ranges header with start options', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const options = {
            numOfConnections: 5
        };
        let fileContentLengthCounter = 0;
        new multipart_download_1.MultipartDownload()
            .start(test_config_1.TestConfig.AcceptRangesUnsupportedUrl.url, options)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', () => {
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesUnsupportedUrl.contentLength);
            done();
        })
            .on('error', (err) => {
            done(err);
        });
    });
});
