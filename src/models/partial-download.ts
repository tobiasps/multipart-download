import events = require('events');
import request = require('request');

import {AcceptRanges} from './accept-ranges';

export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}

export class PartialDownload extends events.EventEmitter {
    private request: request.Request;

    public start(url: string, range: PartialDownloadRange): PartialDownload {

        const options: request.CoreOptions = {
                    headers: {
                        Range: `${AcceptRanges.Bytes}=${range.start}-${range.end}`
                    }
                };

        let offset: number = range.start;
        this.request = request
            .get(url, options)
            .on('error', (err) => {
                this.emit('error', err);
            })
            .on('data', (data) => {
                this.emit('data', data, offset);
                offset += data.length;
            })
            .on('end', () => {
                this.emit('end');
            });

        return this;
    }

    public stop() {
      this.request.abort();
    }
}
