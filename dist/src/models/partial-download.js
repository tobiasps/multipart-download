"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialDownload = void 0;
const events = require("events");
const https_1 = require("https");
const accept_ranges_1 = require("./accept-ranges");
class PartialDownload extends events.EventEmitter {
    constructor() {
        super(...arguments);
        this.aborted = false;
        this.paused = false;
        this._isError = false;
    }
    start(uri, range) {
        this.aborted = false;
        if (range.start >= range.end) {
            this.emit('end', this, range);
            return this;
        }
        const url = new URL(uri);
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
            this.on('pause', () => {
                res.pause();
            });
            this.on('resume', () => {
                res.resume();
            });
        });
        this.request.on('error', (e) => {
            this._isError = true;
            this.emit('error', this, e, range);
        });
        return this;
    }
    stop() {
        if (this.request) {
            this.request.abort();
        }
        this.aborted = true;
    }
    pause() {
        this.emit('pause');
        this.paused = true;
    }
    resume() {
        this.emit('resume');
        this.paused = false;
    }
    isAborted() {
        return this.aborted;
    }
    isPaused() {
        return this.paused;
    }
    isError() {
        return this._isError;
    }
}
exports.PartialDownload = PartialDownload;
