"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const chai_1 = require("chai");
const buffer_operation_1 = require("../src/models/buffer-operation");
const default_operation_1 = require("../src/models/default-operation");
const file_operation_1 = require("../src/models/file-operation");
const operation_factory_1 = require("../src/models/operation-factory");
describe('Operation factory', () => {
    it('default operation', () => {
        const options = {};
        const operation = operation_factory_1.OperationFactory.getOperation(options);
        chai_1.expect(operation).to.be.instanceof(default_operation_1.DefaultOperation);
    });
    it('buffer operation', () => {
        const options = {
            writeToBuffer: true
        };
        const operation = operation_factory_1.OperationFactory.getOperation(options);
        chai_1.expect(operation).to.be.instanceof(buffer_operation_1.BufferOperation);
    });
    it('file operation', () => {
        const options = {
            saveDirectory: os.tmpdir()
        };
        const operation = operation_factory_1.OperationFactory.getOperation(options);
        chai_1.expect(operation).to.be.instanceof(file_operation_1.FileOperation);
    });
});
