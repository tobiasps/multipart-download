import events = require('events');
import fs = require('fs');
import queue = require('queue');

import {FileSegmentation} from '../utilities/file-segmentation';
import {PathFormatter} from '../utilities/path-formatter';
import {UrlParser} from '../utilities/url-parser';

import {Operation} from "./operation";
import {PartialDownload, PartialDownloadRange} from './partial-download';

export class FileOperation implements Operation {

    private readonly emitter: events.EventEmitter = new events.EventEmitter();
    private q: queue;

    public constructor(private saveDirectory: string, private fileName?: string) {
      this.q = queue();
      this.q.timeout = 0;
      this.q.autostart = true;
      this.q.concurrency = 1;

      this.q.on('error', (result: any, job: Function) => {
          this.emitter.emit('error', result);
      });
    }

    public start(url: string, contentLength: number, numOfConnections: number): events.EventEmitter {
        const filePath = this.createFile(url, this.saveDirectory, this.fileName);

        const fd = fs.openSync(filePath, 'r+');
        let endCounter: number = 0;

        const segmentsRange: PartialDownloadRange[] = FileSegmentation.getSegmentsRange(contentLength, numOfConnections);
        for (let segmentRange of segmentsRange) {

            new PartialDownload()
                .start(url, segmentRange)
                .on('error', (pd: PartialDownload, err) => {
                    this.emitter.emit('error', err);
                })
                .on('data', (pd: PartialDownload, data, offset) => {
                    this.emitter.emit('data', data, offset);

                    this.q.push(() => {
                        return new Promise((resolve, reject) => {
                            fs.write(fd, data, 0, data.length, offset, (err, written) => {
                                if (err) {
                                    this.q.end();
                                    reject(err);
                                } else {
                                    resolve(written);
                                }
                            });
                        })
                    });
                })
                .on('end', (pd: PartialDownload) => {
                    if (++endCounter === numOfConnections) {
                        this.q.push(() => {
                            return new Promise((resolve, reject) => {
                                fs.close(fd, (err) => {
                                    if (err) {
                                        this.emitter.emit('error', err);
                                        reject(err);
                                    } else {
                                        this.emitter.emit('end', filePath);
                                        resolve();
                                    }
                                });
                            });
                        });
                    }
                });
        }

        return this.emitter;
    }

    private createFile(url: string, directory: string, fileName?: string): string {
        const file: string = fileName ? fileName: UrlParser.getFilename(url);

        const filePath: string = PathFormatter.format(directory, file);

        fs.createWriteStream(filePath).end();

        return filePath;
    }
}