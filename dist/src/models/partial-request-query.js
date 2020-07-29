"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartialRequestQuery = void 0;
const https_1 = require("https");
class PartialRequestQuery {
    getMetadata(uri) {
        return new Promise((resolve, reject) => {
            const url = new URL(uri);
            const options = {
                hostname: url.hostname,
                path: `${url.pathname}${url.search}`,
                method: 'HEAD'
            };
            const req = https_1.request(options, (res) => {
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
exports.PartialRequestQuery = PartialRequestQuery;
