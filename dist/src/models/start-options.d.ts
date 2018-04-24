export interface StartOptions {
    numOfConnections?: number;
    writeToBuffer?: boolean;
    saveDirectory?: string;
    fileName?: string;
    resume?: boolean;
    metadataPathExtension?: string;
    metadataPathPrefix?: string;
}
