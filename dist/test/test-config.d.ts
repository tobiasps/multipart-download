export interface ContentLengthUrlPair {
    readonly contentLength: number;
    readonly url: string;
}
export declare class TestConfig {
    static readonly AcceptRangesSupportedUrl: ContentLengthUrlPair;
    static readonly AcceptRangesUnsupportedUrl: ContentLengthUrlPair;
    static readonly Timeout: number;
}
