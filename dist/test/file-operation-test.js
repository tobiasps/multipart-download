"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os = require("os");
const chai_1 = require("chai");
const test_config_1 = require("./test-config");
const file_operation_1 = require("../src/models/file-operation");
describe('File operation', () => {
    it('single connection download', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const numOfConnections = 1;
        let fileContentLengthCounter = 0;
        new file_operation_1.FileOperation(os.tmpdir())
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength, numOfConnections)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', (filePath) => {
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            chai_1.expect(filePath).to.exist;
            // check downloaded file exist
            fs.lstat(filePath, (err, stats) => {
                chai_1.expect(err).to.be.null;
                // delete downloaded file
                fs.unlink(filePath, (err) => {
                    chai_1.expect(err).to.be.null;
                    done();
                });
            });
        });
    });
    it('multi connection download and save file with name from url', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const numOfConnections = 5;
        let fileContentLengthCounter = 0;
        new file_operation_1.FileOperation(os.tmpdir())
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength, numOfConnections)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', (filePath) => {
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            chai_1.expect(filePath).to.exist;
            // check downloaded file exist
            fs.lstat(filePath, (err, stats) => {
                chai_1.expect(err).to.be.null;
                // delete downloaded file
                fs.unlink(filePath, (err) => {
                    chai_1.expect(err).to.be.null;
                    done();
                });
            });
        });
    });
    it('multi connection download and save file with name with specified name', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const numOfConnections = 5;
        let fileContentLengthCounter = 0;
        new file_operation_1.FileOperation(os.tmpdir(), 'kittycat.png')
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength, numOfConnections)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', (filePath) => {
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            chai_1.expect(filePath).to.exist;
            // check downloaded file exist
            fs.lstat(filePath, (err, stats) => {
                chai_1.expect(err).to.be.null;
                // delete downloaded file
                fs.unlink(filePath, (err) => {
                    chai_1.expect(err).to.be.null;
                    done();
                });
            });
        });
    });
});
