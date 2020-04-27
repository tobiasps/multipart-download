/// <reference types="node" />
import { Writable, WritableOptions } from 'stream';
export declare class WriteStream extends Writable {
    private metadataBufferSize;
    private readonly fd;
    constructor(path: string, options?: WritableOptions);
    writeWithOffset(chunk: Buffer, offset: number, callback: Function): boolean;
    _write(chunk: any, encoding: string, callback: Function): void;
}
