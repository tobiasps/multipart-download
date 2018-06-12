"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
class PartialRequestQuery {
    getMetadata(url) {
        return new Promise((resolve, reject) => {
            request.head(url, (err, res, body) => {
                if (err) {
                    reject(err);
                }
                else if (res.statusCode !== 405 && (res.statusCode < 200 || res.statusCode >= 300)) {
                    reject(`Error getting metadata, status code: ${res.statusCode}`);
                }
                // 405 Method not allowed - we allow 405 as it may be that we are allowed to download the file although
                // we are not allowed to do the HEAD request.
                const metadata = {
                    acceptRanges: res.headers['accept-ranges'],
                    contentLength: parseInt(res.headers['content-length'])
                };
                resolve(metadata);
            });
        });
    }
}
exports.PartialRequestQuery = PartialRequestQuery;
