"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDuplicateError = void 0;
const handleDuplicateError = (err) => {
    const matchArray = err.message.match(/"([^"]*)"/);
    return {
        statusCode: 400,
        message: `${matchArray[1]} already exists`
    };
};
exports.handleDuplicateError = handleDuplicateError;
