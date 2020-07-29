import events = require('events');
import {ClientRequest} from 'http';
import {get, RequestOptions} from 'https';

import {AcceptRanges} from './accept-ranges';

export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}

export class PartialDownload extends events.EventEmitter {
    private request: ClientRequest;
    private aborted: boolean = false;
    private paused = false;
    private _isError: boolean = false;

    public start(uri: string, range: PartialDownloadRange): PartialDownload {
        this.aborted = false;
        if (range.start >= range.end) {
          this.emit('end', this, range);
          return this;
        }

        const url = new URL(uri);

        const options: RequestOptions = {
          hostname: url.hostname,
          path: `${url.pathname}${url.search}`,
          headers: {
              Range: `${AcceptRanges.Bytes}=${range.start}-${range.end}`
          }
        };

        let offset: number = range.start;

        this.request = get(options, (res) => {
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
          })
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

    public stop() {
      if (this.request) {
        this.request.abort();
      }
      this.aborted = true;
    }

    public pause() {
      this.emit('pause');
      this.paused = true;
    }

    public resume() {
      this.emit('resume');
      this.paused = false;
    }

    public isAborted() {
      return this.aborted;
    }

    public isPaused() {
      return this.paused;
    }

    public isError() {
      return this._isError;
    }
}
