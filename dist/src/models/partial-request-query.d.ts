export interface PartialRequestMetadata {
    readonly acceptRanges: string;
    readonly contentLength: number;
}
export declare class PartialRequestQuery {
    getMetadata(uri: string): Promise<PartialRequestMetadata>;
}
