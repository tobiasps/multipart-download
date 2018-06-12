"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const fs = require("fs");
const queue = require("queue");
const file_segmentation_1 = require("../utilities/file-segmentation");
const path_formatter_1 = require("../utilities/path-formatter");
const url_parser_1 = require("../utilities/url-parser");
const partial_download_1 = require("./partial-download");
class FileOperation {
    constructor(saveDirectory, fileName, options) {
        this.emitter = new events.EventEmitter();
        this.downloaders = [];
        this.metadataBufferSize = 1024;
        this.segmentBufferSize = 64;
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
        this.q = queue();
        this.q.timeout = 0;
        this.q.autostart = true;
        this.q.concurrency = 1;
        this.q.on('error', (result, job) => {
            this.emitter.emit('error', result);
        });
    }
    start(url, contentLength, numOfConnections) {
        const filePath = this.getFilePath(url, this.saveDirectory, this.fileName);
        let endCounter = 0;
        let segmentsRange = file_segmentation_1.FileSegmentation.getSegmentsRange(contentLength, numOfConnections);
        let progressMap = this.setupProgress(segmentsRange);
        const metadataPath = this.getMetadataPath(filePath);
        if (this.options.resume && fs.existsSync(filePath) && fs.existsSync(metadataPath)) {
            try {
                const metadata = this.parseMetadataFile(metadataPath);
                segmentsRange = metadata.resumeSegments;
                numOfConnections = segmentsRange.length;
                progressMap = this.setupProgress(metadata.segments, metadata.resumeSegments);
            }
            catch (err) {
                this.createMetadataFile(segmentsRange, url, contentLength, this.saveDirectory, this.fileName);
            }
        }
        else {
            this.createFile(filePath);
            this.createMetadataFile(segmentsRange, url, contentLength, this.saveDirectory, this.fileName);
        }
        const fd = fs.openSync(filePath, 'r+');
        const metadataFd = fs.openSync(metadataPath, 'r+');
        let index = 0;
        const rangeMap = new Map();
        for (let segmentRange of segmentsRange) {
            rangeMap.set(segmentRange.start, index);
            this.downloaders.push(new partial_download_1.PartialDownload()
                .start(url, segmentRange)
                .on('error', (pd, err, range) => {
                this.emitter.emit('error', err, range);
            })
                .on('data', (pd, data, offset, range) => {
                this.emitter.emit('data', data, offset, range);
                this.q.push(() => {
                    return new Promise((resolve, reject) => {
                        fs.write(fd, data, 0, data.length, offset, (err, written) => {
                            if (err) {
                                this.q.end();
                                reject(err);
                            }
                            else {
                                resolve(written);
                            }
                            // get segment index
                            const i = rangeMap.get(range.start);
                            // write resume metadata
                            const buf = Buffer.alloc(this.segmentBufferSize);
                            buf.write(JSON.stringify({ index: i, offset: offset, length: data.length }), 0, undefined, 'utf8');
                            fs.write(metadataFd, buf, 0, buf.length, this.metadataBufferSize + i * this.segmentBufferSize, () => { });
                            // Calculate progress
                            const p = progressMap.get(i);
                            p.transferred = offset + data.length - p.start;
                            p.progress = p.transferred / (p.end - p.start);
                            let accumulatedProgress = 0;
                            progressMap.forEach((val) => {
                                accumulatedProgress += val.progress;
                            });
                            let totalProgress = accumulatedProgress / progressMap.size;
                            totalProgress = totalProgress > 1 ? 1 : totalProgress;
                            this.emitter.emit('progress', totalProgress);
                        });
                    });
                });
            })
                .on('end', (pd) => {
                if (!pd.isError() && !pd.isAborted() && ++endCounter === numOfConnections) {
                    this.q.push(() => {
                        return new Promise((resolve, reject) => {
                            fs.close(fd, (err) => {
                                if (err) {
                                    this.emitter.emit('error', err);
                                    reject(err);
                                }
                                else {
                                    try {
                                        fs.close(metadataFd, (err) => {
                                            if (!err) {
                                                fs.unlinkSync(metadataPath);
                                            }
                                        });
                                        this.emitter.emit('progress', 1);
                                        this.emitter.emit('end', filePath);
                                        resolve();
                                    }
                                    catch (reason) {
                                        this.emitter.emit('error', reason);
                                        reject(reason);
                                    }
                                }
                            });
                        });
                    });
                }
            }));
            index++;
        }
        return this.emitter;
    }
    stop() {
        for (const downloader of this.downloaders) {
            downloader.stop();
        }
    }
    createFile(filePath) {
        fs.createWriteStream(filePath).end();
        return filePath;
    }
    getFilePath(url, directory, fileName) {
        const file = fileName ? fileName : url_parser_1.UrlParser.getFilename(url);
        return path_formatter_1.PathFormatter.format(directory, file);
    }
    getMetadataPath(filePath) {
        const prefix = this.options.metadataPathPrefix;
        const ext = this.options.metadataPathExtension;
        return `${prefix}${filePath}.${ext}`;
    }
    createMetadataFile(segments, url, contentLength, directory, fileName) {
        const file = fileName ? fileName : url_parser_1.UrlParser.getFilename(url);
        const filePath = path_formatter_1.PathFormatter.format(directory, file);
        const data = {
            url: url,
            contentLength: contentLength,
            directory: directory,
            filename: file,
            segments: segments
        };
        const metadataPath = this.getMetadataPath(filePath);
        const buf = Buffer.alloc(this.metadataBufferSize);
        buf.write(JSON.stringify(data), 0, undefined, 'utf8');
        fs.writeFileSync(metadataPath, buf, { flag: 'w' });
        return metadataPath;
    }
    parseMetadataFile(metadataPath) {
        if (fs.existsSync(metadataPath)) {
            const fd = fs.openSync(metadataPath, 'r');
            // metadata
            const metadataBuf = Buffer.allocUnsafe(this.metadataBufferSize);
            fs.readSync(fd, metadataBuf, 0, this.metadataBufferSize, 0);
            const metadata = this.bufferToJson(metadataBuf);
            // segment status
            const resumeSegments = [];
            for (let i = 0; i < metadata.segments.length; i++) {
                const segmentBuf = Buffer.allocUnsafe(this.segmentBufferSize);
                fs.readSync(fd, segmentBuf, 0, this.segmentBufferSize, this.metadataBufferSize + this.segmentBufferSize * i);
                const segment = this.bufferToJson(segmentBuf);
                resumeSegments[segment.index] = {
                    start: segment.offset + segment.length,
                    end: metadata.segments[segment.index].end
                };
            }
            metadata.resumeSegments = resumeSegments;
            fs.closeSync(fd);
            return metadata;
        }
        else {
            throw new Error(`Metadata file does not exist ${metadataPath}`);
        }
    }
    bufferToJson(b) {
        const lastChar = b.lastIndexOf(Buffer.from('}', 'utf8'));
        return JSON.parse(b.toString('utf8', 0, lastChar + 1));
    }
    setupProgress(segments, resumeSegments) {
        const progressMap = new Map();
        for (let i = 0; i < segments.length; i++) {
            const p = {
                start: segments[i].start,
                end: segments[i].end,
                transferred: 0,
                progress: 0,
            };
            if (resumeSegments) {
                p.transferred = resumeSegments[i].start - segments[i].start;
                p.progress = p.transferred / (p.end - p.start);
            }
            progressMap.set(i, p);
        }
        return progressMap;
    }
}
exports.FileOperation = FileOperation;
