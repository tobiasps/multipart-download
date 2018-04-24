"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const file_segmentation_1 = require("../src/utilities/file-segmentation");
describe('File download segmentation', () => {
    it('is correct size segmentation', () => {
        const downloadRanges = [];
        downloadRanges.push({ start: 0, end: 199 });
        downloadRanges.push({ start: 200, end: 399 });
        downloadRanges.push({ start: 400, end: 599 });
        downloadRanges.push({ start: 600, end: 799 });
        downloadRanges.push({ start: 800, end: 999 });
        const result = file_segmentation_1.FileSegmentation.getSegmentsRange(1000, 5);
        chai_1.expect(result).to.deep.equal(downloadRanges);
    });
});
