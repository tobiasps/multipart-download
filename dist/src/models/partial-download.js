"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const request = require("request");
const uuid = require("uuid/v1");
const accept_ranges_1 = require("./accept-ranges");
class PartialDownload extends events.EventEmitter {
    constructor() {
        super(...arguments);
        this.aborted = false;
    }
    start(url, range) {
        this.aborted = false;
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
            this.emit('error', this, err, range);
        })
            .on('data', (data) => {
            this.emit('data', this, data, offset, range);
            offset += data.length;
        })
            .on('end', () => {
            this.emit('end', this, range);
        });
        return this;
    }
    stop() {
        this.request.abort();
        this.aborted = true;
    }
    getId() {
        if (!this.id) {
            this.id = uuid();
        }
        return this.id;
    }
    isAborted() {
        return this.aborted;
    }
}
exports.PartialDownload = PartialDownload;
