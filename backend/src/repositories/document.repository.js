"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDocument = exports.getDocumentById = exports.getDocumentsByUser = exports.createDocument = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const client_1 = require("@prisma/client");
const createDocument = async (data) => {
    return prisma_1.default.document.create({
        data,
    });
};
exports.createDocument = createDocument;
const getDocumentsByUser = async (userId) => {
    return prisma_1.default.document.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getDocumentsByUser = getDocumentsByUser;
const getDocumentById = async (id, userId) => {
    return prisma_1.default.document.findFirst({
        where: { id, userId },
    });
};
exports.getDocumentById = getDocumentById;
const deleteDocument = async (id, userId) => {
    return prisma_1.default.document.deleteMany({
        where: { id, userId },
    });
};
exports.deleteDocument = deleteDocument;
//# sourceMappingURL=document.repository.js.map