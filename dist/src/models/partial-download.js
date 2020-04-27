"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const https_1 = require("https");
const url_1 = require("url");
const accept_ranges_1 = require("./accept-ranges");
class PartialDownload extends events.EventEmitter {
    constructor() {
        super(...arguments);
        this.aborted = false;
        this._isError = false;
    }
    start(uri, range) {
        this.aborted = false;
        if (range.start >= range.end) {
            this.emit('end');
            return this;
        }
        const url = new url_1.URL(uri);
        const options = {
            hostname: url.hostname,
            path: `${url.pathname}${url.search}`,
            headers: {
                Range: `${accept_ranges_1.AcceptRanges.Bytes}=${range.start}-${range.end}`
            }
        };
        let offset = range.start;
        this.request = https_1.get(options, (res) => {
            const { statusCode } = res;
            const contentType = res.headers['content-type'];
            let error;
            if (statusCode !== 200 && statusCode !== 206) {
                this._isError = true;
                error = new Error(`Unexpected status code ${statusCode}`);
            }
            if (error) {
                this.emit('error', this, error, range);
                res.resume();
                return;
            }
            res.on('data', (chunk) => {
                this.emit('data', this, chunk, offset, range);
                offset += chunk.length;
            });
            res.on('end', () => {
                this.emit('end', this, range);
            });
        });
        this.request.on('error', (e) => {
            this._isError = true;
            this.emit('error', this, e, range);
        });
        return this;
    }
    stop() {
        this.request.abort();
        this.aborted = true;
    }
    isAborted() {
        return this.aborted;
    }
    isError() {
        return this._isError;
    }
}
exports.PartialDownload = PartialDownload;
