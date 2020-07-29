"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationFactory = void 0;
const buffer_operation_1 = require("./buffer-operation");
const default_operation_1 = require("./default-operation");
const file_operation_1 = require("./file-operation");
class OperationFactory {
    static getOperation(options) {
        let operation;
        if (options.writeToBuffer) {
            operation = new buffer_operation_1.BufferOperation();
        }
        else if (options.saveDirectory) {
            operation = new file_operation_1.FileOperation(options.saveDirectory, options.fileName, options);
        }
        else {
            operation = new default_operation_1.DefaultOperation();
        }
        return operation;
    }
}
exports.OperationFactory = OperationFactory;
