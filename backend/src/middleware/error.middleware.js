"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const express_1 = require("express");
const AppError_1 = require("../utils/AppError");
const zod_1 = require("zod");
const globalErrorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            status: 'fail',
            message: err.errors.map(e => e.message).join(', '),
        });
    }
    if (err instanceof AppError_1.AppError) {
        return res.status(err.statusCode).json({
            status: 'fail',
            message: err.message,
        });
    }
    console.error('ERROR 💥', err);
    res.status(500).json({
        status: 'error',
        message: 'Something went very wrong!',
    });
};
exports.globalErrorHandler = globalErrorHandler;
//# sourceMappingURL=error.middleware.js.map