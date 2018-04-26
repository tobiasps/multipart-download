import events = require('events');
import request = require('request');
import uuid = require('uuid/v1');


import {AcceptRanges} from './accept-ranges';

export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}

export class PartialDownload extends events.EventEmitter {
    private id: string;

    public start(url: string, range: PartialDownloadRange): PartialDownload {
        const options: request.CoreOptions = {
                    headers: {
                        Range: `${AcceptRanges.Bytes}=${range.start}-${range.end}`
                    }
                };

        let offset: number = range.start;
        request
            .get(url, options)
            .on('error', (err) => {
                this.emit('error', this, err);
            })
            .on('data', (data) => {
                this.emit('data', this, data, offset);
                offset += data.length;
            })
            .on('end', () => {
                this.emit('end', this);
            });

        return this;
    }

    public getId() {
      if (!this.id) {
        this.id = uuid();
      }
      return this.id;
    }
}
