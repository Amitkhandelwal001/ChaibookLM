"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchUserDocuments = exports.processFileUpload = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const user_repository_1 = require("../repositories/user.repository");
const document_repository_1 = require("../repositories/document.repository");
const AppError_1 = require("../utils/AppError");
const prisma_1 = __importDefault(require("../utils/prisma"));
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const MAX_STORAGE_LIMIT = 100 * 1024 * 1024; // 100MB
const processFileUpload = async (userId, file) => {
    const user = await (0, user_repository_1.findUserById)(userId);
    if (!user) {
        // Delete local temp file
        if (fs_1.default.existsSync(file.path))
            fs_1.default.unlinkSync(file.path);
        throw new AppError_1.AppError('User not found', 404);
    }
    const newTotalStorage = user.storageUsed + file.size;
    if (newTotalStorage > MAX_STORAGE_LIMIT) {
        if (fs_1.default.existsSync(file.path))
            fs_1.default.unlinkSync(file.path);
        throw new AppError_1.AppError('Upload limit of 100MB exceeded.', 400);
    }
    const fileType = file.mimetype.split('/')[0] === 'image' ? 'IMAGE' : 'DOCUMENT';
    let cloudinaryUrl = '';
    try {
        // Upload to Cloudinary
        const result = await cloudinary_config_1.default.uploader.upload(file.path, {
            resource_type: 'auto',
            folder: `kitbooklm/users/${user.id}`,
        });
        cloudinaryUrl = result.secure_url;
    }
    catch (error) {
        if (fs_1.default.existsSync(file.path))
            fs_1.default.unlinkSync(file.path);
        throw new AppError_1.AppError('Failed to upload file to cloud storage', 500);
    }
    // Delete local temp file after successful cloud upload
    if (fs_1.default.existsSync(file.path))
        fs_1.default.unlinkSync(file.path);
    // Transaction to update user storage and create document
    const document = await prisma_1.default.$transaction(async (tx) => {
        const doc = await tx.document.create({
            data: {
                title: file.originalname,
                type: fileType,
                url: cloudinaryUrl, // Store Cloudinary URL
                size: file.size,
                userId: user.id,
            },
        });
        await tx.user.update({
            where: { id: user.id },
            data: { storageUsed: newTotalStorage },
        });
        return doc;
    });
    return document;
};
exports.processFileUpload = processFileUpload;
const fetchUserDocuments = async (userId) => {
    return (0, document_repository_1.getDocumentsByUser)(userId);
};
exports.fetchUserDocuments = fetchUserDocuments;
//# sourceMappingURL=upload.service.js.map