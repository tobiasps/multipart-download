"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const file_segmentation_1 = require("../utilities/file-segmentation");
const partial_download_1 = require("./partial-download");
class DefaultOperation {
    constructor() {
        this.emitter = new events.EventEmitter();
    }
    start(url, contentLength, numOfConnections) {
        let endCounter = 0;
        const segmentsRange = file_segmentation_1.FileSegmentation.getSegmentsRange(contentLength, numOfConnections);
        for (let segmentRange of segmentsRange) {
            new partial_download_1.PartialDownload()
                .start(url, segmentRange)
                .on('error', (err) => {
                this.emitter.emit('error', err);
            })
                .on('data', (data, offset) => {
                this.emitter.emit('data', data, offset);
            })
                .on('end', () => {
                if (++endCounter === numOfConnections) {
                    this.emitter.emit('end', null);
                }
            });
        }
        return this.emitter;
    }
}
exports.DefaultOperation = DefaultOperation;
