/// <reference types="node" />
import events = require('events');
import { Operation } from "./operation";
export declare class BufferOperation implements Operation {
    private readonly emitter;
    start(url: string, contentLength: number, numOfConnections: number): events.EventEmitter;
}
