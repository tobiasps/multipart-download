"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const events = require("events");
const validation_1 = require("../utilities/validation");
const accept_ranges_1 = require("./accept-ranges");
const operation_factory_1 = require("./operation-factory");
const partial_request_query_1 = require("./partial-request-query");
class MultipartDownload extends events.EventEmitter {
    constructor() {
        super(...arguments);
        this.operations = new Map();
    }
    start(url, startOptions) {
        const options = this.getOptions(startOptions);
        const validationError = this.validateInputs(url, options);
        if (validationError) {
            this.emit('error', validationError);
        }
        this.execute(url, options);
        return this;
    }
    stop() {
        this.operations.forEach((operation) => {
            operation.stop();
        });
        this.operations.clear();
        this.emit('stop');
    }
    pause() {
        this.operations.forEach((operation) => {
            operation.pause();
        });
    }
    resume() {
        this.operations.forEach((operation) => {
            operation.resume();
        });
    }
    getOptions(startOptions) {
        let connections = MultipartDownload.DEFAULT_NUMBER_OF_CONNECTIONS;
        let directory;
        let file;
        let metadataPathPrefix = '';
        let metadataPathExtension = 'dat';
        let resume = true;
        if (startOptions) {
            connections = startOptions.numOfConnections ?
                startOptions.numOfConnections : connections;
            directory = startOptions.saveDirectory;
            file = startOptions.fileName;
            metadataPathPrefix = startOptions.metadataPathPrefix || metadataPathPrefix;
            metadataPathExtension = startOptions.metadataPathExtension || metadataPathExtension;
            resume = startOptions.resume || resume;
        }
        const options = {
            numOfConnections: connections,
            saveDirectory: directory,
            fileName: file,
            resume: resume,
            metadataPathPrefix: metadataPathPrefix,
            metadataPathExtension: metadataPathExtension
        };
        return options;
    }
    execute(url, options) {
        new partial_request_query_1.PartialRequestQuery()
            .getMetadata(url)
            .then((metadata) => {
            const metadataError = this.validateMetadata(url, metadata);
            if (metadataError) {
                this.emit('error', metadataError);
                return;
            }
            if (metadata.acceptRanges !== accept_ranges_1.AcceptRanges.Bytes) {
                options.numOfConnections = MultipartDownload.SINGLE_CONNECTION;
            }
            const operation = operation_factory_1.OperationFactory.getOperation(options);
            operation
                .start(url, metadata.contentLength, options.numOfConnections)
                .on('error', (err, range) => {
                this.emit('error', err, range);
                this.operations.delete(url);
            })
                .on('data', (data, offset, range) => {
                this.emit('data', data, offset, range);
            })
                .on('end', (output) => {
                this.emit('end', output);
                this.operations.delete(url);
            })
                .on('progress', (progress) => {
                this.emit('progress', progress);
            })
                .on('pause', () => {
                this.emit('pause');
            })
                .on('resume', () => {
                this.emit('resume');
            });
            this.operations.set(url, operation);
        })
            .catch((err) => {
            this.emit('error', err);
        });
    }
    validateInputs(url, options) {
        if (!validation_1.Validation.isUrl(url)) {
            return new Error('Invalid URL provided');
        }
        if (!validation_1.Validation.isValidNumberOfConnections(options.numOfConnections)) {
            return new Error('Invalid number of connections provided');
        }
        if (options.saveDirectory && !validation_1.Validation.isDirectory(options.saveDirectory)) {
            return new Error('Invalid save directory provided');
        }
        if (options.fileName && !validation_1.Validation.isValidFileName(options.fileName)) {
            return new Error('Invalid file name provided');
        }
        return null;
    }
    validateMetadata(url, metadata) {
        if (isNaN(metadata.contentLength)) {
            return new Error(`Failed to query Content-Length of ${url}`);
        }
        return null;
    }
}
MultipartDownload.DEFAULT_NUMBER_OF_CONNECTIONS = 1;
MultipartDownload.SINGLE_CONNECTION = 1;
exports.MultipartDownload = MultipartDownload;
