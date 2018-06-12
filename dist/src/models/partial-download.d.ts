/// <reference types="node" />
import events = require('events');
export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}
export declare class PartialDownload extends events.EventEmitter {
    private request;
    private id;
    private aborted;
    private _isError;
    start(url: string, range: PartialDownloadRange): PartialDownload;
    stop(): void;
    getId(): string;
    isAborted(): boolean;
    isError(): boolean;
}
