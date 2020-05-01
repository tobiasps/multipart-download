/// <reference types="node" />
import events = require('events');
export interface PartialDownloadRange {
    readonly start: number;
    readonly end: number;
}
export declare class PartialDownload extends events.EventEmitter {
    private request;
    private aborted;
    private paused;
    private _isError;
    start(uri: string, range: PartialDownloadRange): PartialDownload;
    stop(): void;
    pause(): void;
    resume(): void;
    isAborted(): boolean;
    isPaused(): boolean;
    isError(): boolean;
}
