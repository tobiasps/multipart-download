"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const test_config_1 = require("./test-config");
const buffer_operation_1 = require("../src/models/buffer-operation");
describe('Buffer operation', () => {
    it('single connection download', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const numOfConnections = 1;
        let fileContentLengthCounter = 0;
        new buffer_operation_1.BufferOperation()
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength, numOfConnections)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', (buffer) => {
            chai_1.expect(buffer.length).to.be.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            done();
        });
    });
    it('multi connection download', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const numOfConnections = 5;
        let fileContentLengthCounter = 0;
        new buffer_operation_1.BufferOperation()
            .start(test_config_1.TestConfig.AcceptRangesSupportedUrl.url, test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength, numOfConnections)
            .on('data', (data, offset) => {
            fileContentLengthCounter += data.length;
        })
            .on('end', (buffer) => {
            chai_1.expect(buffer.length).to.be.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            chai_1.expect(fileContentLengthCounter).to.equal(test_config_1.TestConfig.AcceptRangesSupportedUrl.contentLength);
            done();
        });
    });
});
