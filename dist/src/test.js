"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multipart_download_1 = require("./models/multipart-download");
const d = new multipart_download_1.MultipartDownload()
    .start('https://iogates.com/download-file/1589655/0/0/1/0/4425-CRh7aaKz8GRzw6TH7yIXJi6dNuROjcbi', {
    numOfConnections: 3,
    saveDirectory: './',
    fileName: 'test.mp4'
})
    .on('error', (err) => {
    console.log(err);
})
    .on('data', (data, offset) => {
    // manipulate data here
    // d.stop();
})
    .on('end', (output) => {
    console.log(`Downloaded file path: ${output}`);
})
    .on('progress', (progress) => {
    console.log(progress);
});
