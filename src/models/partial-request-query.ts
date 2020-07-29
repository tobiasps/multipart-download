import {request, RequestOptions} from 'https';

export interface PartialRequestMetadata {
    readonly acceptRanges: string;
    readonly contentLength: number;
}

export class PartialRequestQuery {
    public getMetadata(uri: string): Promise<PartialRequestMetadata> {

        return new Promise<PartialRequestMetadata>((resolve, reject) => {
            const url = new URL(uri);

            const options: RequestOptions = {
                hostname: url.hostname,
                path: `${url.pathname}${url.search}`,
                method: 'HEAD'
            };

            const req = request(options, (res) => {
                if (res.statusCode !== 405 && (res.statusCode < 200 || res.statusCode >= 300)) {
                    return reject(new Error(`Error getting metadata, status code: ${res.statusCode}`));
                }

                const metadata = {
                    acceptRanges: res.headers['accept-ranges'],
                    contentLength: parseInt(res.headers['content-length'])
                };

                return resolve(metadata);
            });
            req.on('error', (err) => {
                return reject(err);
            });
            req.end();
        });
    }
}
