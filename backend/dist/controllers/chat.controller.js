"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = void 0;
const chat_service_1 = require("../services/chat.service");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.handleChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { question, documentId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    if (!question || typeof question !== 'string') {
        return res.status(400).json({ status: 'fail', message: 'Question is required and must be a string.' });
    }
    const answer = await (0, chat_service_1.generateChatResponse)(question, userId, documentId);
    res.status(200).json({
        status: 'success',
        data: {
            answer,
        },
    });
});
