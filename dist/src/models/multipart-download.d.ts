/// <reference types="node" />
import events = require('events');
import { StartOptions } from './start-options';
export interface MultipartOperation {
    start(url: string, options?: StartOptions): MultipartOperation;
}
export declare class MultipartDownload extends events.EventEmitter implements MultipartOperation {
    private static readonly DEFAULT_NUMBER_OF_CONNECTIONS;
    private static readonly SINGLE_CONNECTION;
    private operations;
    start(url: string, startOptions?: StartOptions): MultipartDownload;
    stop(): void;
    pause(): void;
    resume(): void;
    private getOptions;
    private execute;
    private validateInputs;
    private validateMetadata;
}
