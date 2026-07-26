"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDocumentsHandler = exports.uploadFileHandler = void 0;
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const upload_service_1 = require("../services/upload.service");
const AppError_1 = require("../utils/AppError");
exports.uploadFileHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.file) {
        throw new AppError_1.AppError('No file uploaded', 400);
    }
    // @ts-ignore
    const userId = req.user.id;
    const document = await (0, upload_service_1.processFileUpload)(userId, req.file);
    res.status(201).json({
        status: 'success',
        data: document,
    });
});
exports.getDocumentsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // @ts-ignore
    const userId = req.user.id;
    const documents = await (0, upload_service_1.fetchUserDocuments)(userId);
    res.status(200).json({
        status: 'success',
        data: documents,
    });
});
//# sourceMappingURL=upload.controller.js.map