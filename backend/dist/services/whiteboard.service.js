"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserWhiteboards = exports.getWhiteboard = exports.saveWhiteboard = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const saveWhiteboard = async (userId, title, data, id) => {
    if (id) {
        return await prisma_1.default.whiteboard.update({
            where: { id, userId },
            data: { title, data }
        });
    }
    return await prisma_1.default.whiteboard.create({
        data: {
            userId,
            title,
            data,
        }
    });
};
exports.saveWhiteboard = saveWhiteboard;
const getWhiteboard = async (id, userId) => {
    return await prisma_1.default.whiteboard.findUnique({
        where: { id, userId }
    });
};
exports.getWhiteboard = getWhiteboard;
const getUserWhiteboards = async (userId) => {
    return await prisma_1.default.whiteboard.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            title: true,
            updatedAt: true
            // Omit heavy JSON data for list view
        }
    });
};
exports.getUserWhiteboards = getUserWhiteboards;
