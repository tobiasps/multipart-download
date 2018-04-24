"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const request = require("request");
const accept_ranges_1 = require("./accept-ranges");
class PartialDownload extends events.EventEmitter {
    start(url, range) {
        if (range.start === range.end) {
            this.emit('end');
            return this;
        }
        const options = {
            headers: {
                Range: `${accept_ranges_1.AcceptRanges.Bytes}=${range.start}-${range.end}`
            }
        };
        let offset = range.start;
        this.request = request
            .get(url, options)
            .on('error', (err) => {
            this.emit('error', err, range);
        })
            .on('data', (data) => {
            this.emit('data', data, offset, range);
            offset += data.length;
        })
            .on('end', () => {
            this.emit('end', range);
        });
        return this;
    }
    stop() {
        this.request.abort();
    }
}
exports.PartialDownload = PartialDownload;
