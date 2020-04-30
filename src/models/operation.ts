import events = require('events');
import {PartialDownloadRange} from './partial-download';

export interface Operation {
    start(url: string, contentLength: number, numOfConnections: number): events.EventEmitter;
    stop();
    pause();
    resume();
}

export interface IMetadata {
    url: string;
    contentLength: number;
    directory: string;
    filename: string,
    segments: PartialDownloadRange[];
    resumeSegments?: PartialDownloadRange[];
}

export interface IProgressData {
    start: number;
    end: number;
    transferred: number;
    progress: number;
}
