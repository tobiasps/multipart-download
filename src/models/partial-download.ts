import events = require('events');
import request = require('request');
import uuid = require('uuid/v1');


import {AcceptRanges} from './accept-ranges';

export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}

export class PartialDownload extends events.EventEmitter {
    private request: request.Request;
    private id: string;
    private aborted: boolean = false;

    public start(url: string, range: PartialDownloadRange): PartialDownload {
        this.aborted = false;
        if (range.start === range.end) {
          this.emit('end');
          return this;
        }

        const options: request.CoreOptions = {
                    headers: {
                        Range: `${AcceptRanges.Bytes}=${range.start}-${range.end}`
                    }
                };

        let offset: number = range.start;
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

    public stop() {
      this.request.abort();
      this.aborted = true;
    }

    public getId() {
      if (!this.id) {
        this.id = uuid();
      }
      return this.id;
    }

    public isAborted() {
      return this.aborted;
    }
}
