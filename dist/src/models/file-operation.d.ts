/// <reference types="node" />
import events = require('events');
import { Operation } from "./operation";
import { StartOptions } from './start-options';
export declare class FileOperation implements Operation {
    private readonly emitter;
    private downloaders;
    private metadataBufferSize;
    private segmentBufferSize;
    private saveDirectory;
    private fileName;
    private options;
    constructor(saveDirectory: string, fileName?: string, options?: StartOptions);
    start(url: string, contentLength: number, numOfConnections: number): events.EventEmitter;
    stop(): void;
    pause(): void;
    resume(): void;
    private createFile;
    private getFilePath;
    private getMetadataPath;
    private createMetadataFile;
    private parseMetadataFile;
    private bufferToJson;
    private setupProgress;
}
