"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
const fs_1 = require("fs");
class WriteStream extends stream_1.Writable {
    constructor(path, options) {
        super(options);
        this.metadataBufferSize = 16;
        if (!fs_1.existsSync(path)) {
            fs_1.closeSync(fs_1.openSync(path, 'w'));
        }
        this.fd = fs_1.openSync(path, 'r+');
        this.on('finish', () => {
            fs_1.close(this.fd, (err) => {
                if (err) {
                    this.emit('error', err);
                }
                else {
                    this.emit('close');
                }
            });
        });
    }
    writeWithOffset(chunk, offset, callback) {
        // to pass the offset through the WritableStream internals we prepend the data with the offset
        const metadata = Buffer.alloc(this.metadataBufferSize);
        metadata.fill(' ');
        metadata.write(`${offset}`);
        return this.write(Buffer.concat([metadata, chunk]), callback);
    }
    _write(chunk, encoding, callback) {
        // Extract the prepended offset
        const offset = +chunk.subarray(0, this.metadataBufferSize).toString();
        // Write from buffer discarding the prepended metadata
        fs_1.write(this.fd, chunk, this.metadataBufferSize, undefined, offset, (err) => {
            callback(err);
        });
    }
}
exports.WriteStream = WriteStream;
