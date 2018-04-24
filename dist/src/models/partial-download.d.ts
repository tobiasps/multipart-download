/// <reference types="node" />
import events = require('events');
export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}
export declare class PartialDownload extends events.EventEmitter {
    private request;
    start(url: string, range: PartialDownloadRange): PartialDownload;
    stop(): void;
}
