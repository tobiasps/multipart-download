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
        this._isError = false;
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
            this._isError = true;
            this.emit('error', this, err, range);
        })
            .on('response', (response) => {
            response.on('data', (data) => {
                // Only emit data if we got valid data
                // note data here is not decompressed if gzip is enabled in request options...
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    this.emit('data', this, data, offset, range);
                    offset += data.length;
                }
                else {
                    this._isError = true;
                    console.log(`Unexpected status code ${response.statusCode}`);
                }
            });
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
    isError() {
        return this._isError;
    }
}
exports.PartialDownload = PartialDownload;
