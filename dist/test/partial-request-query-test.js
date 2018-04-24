"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const test_config_1 = require("./test-config");
const accept_ranges_1 = require("../src/models/accept-ranges");
const partial_request_query_1 = require("../src/models/partial-request-query");
describe('Partial request query', () => {
    it('with Accept-Ranges header', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const partialRequestQuery = new partial_request_query_1.PartialRequestQuery();
        partialRequestQuery
            .getMetadata(test_config_1.TestConfig.AcceptRangesSupportedUrl.url)
            .then((metadata) => {
            chai_1.expect(metadata.acceptRanges).to.equal(accept_ranges_1.AcceptRanges.Bytes);
            chai_1.expect(metadata.contentLength).to.not.be.NaN;
            done();
        });
    });
    xit('without Accept-Ranges header', function (done) {
        this.timeout(test_config_1.TestConfig.Timeout);
        const partialRequestQuery = new partial_request_query_1.PartialRequestQuery();
        partialRequestQuery
            .getMetadata(test_config_1.TestConfig.AcceptRangesUnsupportedUrl.url)
            .then((metadata) => {
            chai_1.expect(metadata.acceptRanges).to.not.exist;
            chai_1.expect(metadata.contentLength).to.not.be.NaN;
            done();
        });
    });
});
