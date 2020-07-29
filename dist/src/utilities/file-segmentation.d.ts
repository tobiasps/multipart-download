import { PartialDownloadRange } from '../models/partial-download';
export declare class FileSegmentation {
    static getSegmentsRange(fileSize: number, numOfSegments: number): PartialDownloadRange[];
    private static getSegmentsSize;
}
