"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferOperation = void 0;
const events = require("events");
const file_segmentation_1 = require("../utilities/file-segmentation");
const partial_download_1 = require("./partial-download");
class BufferOperation {
    constructor() {
        this.emitter = new events.EventEmitter();
        this.downloaders = [];
    }
    start(url, contentLength, numOfConnections) {
        const buffer = Buffer.allocUnsafe(contentLength);
        let endCounter = 0;
        const segmentsRange = file_segmentation_1.FileSegmentation.getSegmentsRange(contentLength, numOfConnections);
        for (let segmentRange of segmentsRange) {
            this.downloaders.push(new partial_download_1.PartialDownload()
                .start(url, segmentRange)
                .on('error', (pd, err) => {
                this.emitter.emit('error', err);
            })
                .on('data', (pd, data, offset) => {
                this.emitter.emit('data', data, offset);
                data.copy(buffer, offset);
            })
                .on('end', (pd) => {
                if (++endCounter === numOfConnections) {
                    this.emitter.emit('end', buffer);
                }
            }));
        }
        return this.emitter;
    }
    stop() {
        for (const downloader of this.downloaders) {
            downloader.stop();
        }
    }
    pause() {
        for (const downloader of this.downloaders) {
            downloader.pause();
        }
        this.emitter.emit('pause');
    }
    resume() {
        for (const downloader of this.downloaders) {
            downloader.resume();
        }
        this.emitter.emit('resume');
    }
}
exports.BufferOperation = BufferOperation;
