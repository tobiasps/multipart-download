import events = require('events');
import fs = require('fs');

import {FileSegmentation} from '../utilities/file-segmentation';
import {PathFormatter} from '../utilities/path-formatter';
import {UrlParser} from '../utilities/url-parser';

import {IMetadata, IProgressData, Operation} from "./operation";
import {PartialDownload, PartialDownloadRange} from './partial-download';
import {StartOptions} from './start-options';

import {WriteStream} from '../utilities/write-stream';

export class FileOperation implements Operation {

    private readonly emitter: events.EventEmitter = new events.EventEmitter();
    private downloaders: PartialDownload[] = [];
    private metadataBufferSize = 1024;
    private segmentBufferSize = 64;
    private saveDirectory: string;
    private fileName: string;
    private options: StartOptions;

    public constructor(saveDirectory: string, fileName?: string, options?: StartOptions) {
        this.saveDirectory = saveDirectory;
        this.fileName = fileName;
        this.options = {
            saveDirectory: saveDirectory,
            fileName: fileName,
            resume: true,
            metadataPathExtension: 'dat',
            metadataPathPrefix: ''
        };
        if (options) {
            for (const key of Object.keys(options)) {
              this.options[key] = options[key];
            }
        }
    }

    public start(url: string, contentLength: number, numOfConnections: number): events.EventEmitter {
        const filePath = this.getFilePath(url, this.saveDirectory, this.fileName);

        let endCounter: number = 0;

        let segmentsRange: PartialDownloadRange[] = FileSegmentation.getSegmentsRange(contentLength, numOfConnections);
        let progressMap = this.setupProgress(segmentsRange);

        const metadataPath = this.getMetadataPath(filePath);
        if (this.options.resume && fs.existsSync(filePath) && fs.existsSync(metadataPath)) {
            try {
              const metadata = this.parseMetadataFile(metadataPath);
              segmentsRange = metadata.resumeSegments;
              numOfConnections = segmentsRange.length;
              progressMap = this.setupProgress(metadata.segments, metadata.resumeSegments);
            } catch (err) {
              this.createMetadataFile(segmentsRange, url, contentLength, this.saveDirectory, this.fileName);
            }
        } else {
            this.createFile(filePath);
            this.createMetadataFile(segmentsRange, url, contentLength, this.saveDirectory, this.fileName);
        }
        const stream = new WriteStream(filePath);
        const metadataStream = new WriteStream(metadataPath);

        let index = 0;
        const rangeMap: Map<number, number> = new Map();

        for (let segmentRange of segmentsRange) {
            rangeMap.set(segmentRange.start, index);
            this.downloaders.push(new PartialDownload()
                .start(url, segmentRange)
                .on('error', (pd: PartialDownload, err, range) => {
                  this.emitter.emit('error', err, range);
                })
                .on('data', (pd: PartialDownload, data, offset, range) => {
                    this.emitter.emit('data', data, offset, range);
                    const i = rangeMap.get(range.start);

                    stream.writeWithOffset(data, offset, (err) => {
                        if (!err) {
                            // write resume metadata
                            const buf = Buffer.alloc(this.segmentBufferSize);
                            buf.write(JSON.stringify({index: i, offset: offset, length: data.length}), 0,
                              undefined,'utf8');
                            /*fs.write(metadataFd, buf, 0, buf.length,
                              this.metadataBufferSize + i * this.segmentBufferSize, () => {});*/
                            // metadataFs.write(buf, () => {});
                            metadataStream.writeWithOffset(buf, this.metadataBufferSize + i * this.segmentBufferSize, () => {});

                            // Calculate progress
                            const p = progressMap.get(i);
                            p.transferred = offset + data.length - p.start;
                            p.progress = p.transferred / (p.end - p .start);

                            let accumulatedProgress = 0;
                            progressMap.forEach((val) => {
                                accumulatedProgress += val.progress;
                            });
                            let totalProgress = accumulatedProgress/progressMap.size;
                            totalProgress = totalProgress > 1 ? 1 : totalProgress;
                            this.emitter.emit('progress', totalProgress);
                        }
                    });
                })
                .on('end', (pd: PartialDownload, range: PartialDownloadRange) => {
                    if (!pd.isError() && !pd.isAborted() && ++endCounter === numOfConnections) {
                        stream.end((err) => {
                            metadataStream.end(() => {
                                fs.unlink(metadataPath, (err) => {
                                    if (err) {
                                        this.emitter.emit('warning', err);
                                    }
                                });
                            })
                            this.emitter.emit('progress', 1);
                            this.emitter.emit('end', filePath);
                        });
                    }
                })
            );
            index++;
        }

        return this.emitter;
    }

    public stop() {
        for (const downloader of this.downloaders) {
            downloader.stop();
        }
    }

    private createFile(filePath: string): string {
        fs.createWriteStream(filePath).end();
        return filePath;
    }

    private getFilePath(url: string, directory: string, fileName?: string) {
        const file: string = fileName ? fileName: UrlParser.getFilename(url);
        return PathFormatter.format(directory, file);
    }

    private getMetadataPath(filePath: string) {
        const prefix = this.options.metadataPathPrefix;
        const ext = this.options.metadataPathExtension;
        return `${prefix}${filePath}.${ext}`;
    }

    private createMetadataFile(
        segments: PartialDownloadRange[],
        url: string,
        contentLength: number,
        directory: string,
        fileName?: string) {

        const file: string = fileName ? fileName: UrlParser.getFilename(url);
        const filePath: string = PathFormatter.format(directory, file);
        const data: IMetadata = {
            url: url,
            contentLength: contentLength,
            directory: directory,
            filename: file,
            segments: segments
        };

        const metadataPath = this.getMetadataPath(filePath);
        const buf = Buffer.alloc(this.metadataBufferSize);
        buf.write(JSON.stringify(data), 0, undefined, 'utf8');
        fs.writeFileSync(metadataPath, buf, {flag: 'w'});

        return metadataPath;
    }

    private parseMetadataFile(metadataPath): IMetadata {
        if (fs.existsSync(metadataPath)) {
            const fd = fs.openSync(metadataPath, 'r');

            // metadata
            const metadataBuf = Buffer.allocUnsafe(this.metadataBufferSize);
            fs.readSync(fd, metadataBuf, 0, this.metadataBufferSize, 0);
            const metadata: IMetadata = this.bufferToJson(metadataBuf);

            // segment status
            const resumeSegments: PartialDownloadRange[] = [];
            for (let i = 0; i < metadata.segments.length; i++) {
                const segmentBuf = Buffer.allocUnsafe(this.segmentBufferSize);
                fs.readSync(fd, segmentBuf, 0, this.segmentBufferSize,
                  this.metadataBufferSize + this.segmentBufferSize * i);
                const segment = this.bufferToJson(segmentBuf);
                resumeSegments[segment.index] = {
                  start: segment.offset + segment.length,
                  end: metadata.segments[segment.index].end
                };
            }
            metadata.resumeSegments = resumeSegments;
            fs.closeSync(fd);

            return metadata;
        } else {
          throw new Error(`Metadata file does not exist ${metadataPath}`);
        }
    }

    private bufferToJson(b: Buffer) {
        const lastChar = b.lastIndexOf(Buffer.from('}', 'utf8'));
        return JSON.parse(b.toString('utf8', 0, lastChar + 1));
    }

    private setupProgress(segments: PartialDownloadRange[], resumeSegments?: PartialDownloadRange[]): Map<number, IProgressData> {
        const progressMap: Map<number, IProgressData> = new Map();
        for (let i = 0; i < segments.length; i++) {
            const p = {
                start: segments[i].start,
                end: segments[i].end,
                transferred: 0,
                progress: 0,
            };
            if (resumeSegments) {
              p.transferred = resumeSegments[i].start - segments[i].start;
              p.progress = p.transferred / (p.end - p .start);
            }
            progressMap.set(i, p);
        }
        return progressMap;
    }
}
