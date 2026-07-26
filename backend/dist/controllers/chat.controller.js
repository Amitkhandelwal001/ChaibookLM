"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchChatTree = exports.fetchUserChats = exports.handleChat = void 0;
const chat_service_1 = require("../services/chat.service");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.handleChat = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { question, documentId, chatId, parentMessageId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    if (!question || typeof question !== 'string') {
        return res.status(400).json({ status: 'fail', message: 'Question is required and must be a string.' });
    }
    const result = await (0, chat_service_1.generateChatResponse)(question, userId, documentId, chatId, parentMessageId);
    res.status(200).json({
        status: 'success',
        data: result,
    });
});
exports.fetchUserChats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const chats = await (0, chat_service_1.getUserChats)(userId);
    res.status(200).json({
        status: 'success',
        data: { chats },
    });
});
exports.fetchChatTree = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    const { chatId } = req.params;
    if (!userId)
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const tree = await (0, chat_service_1.getChatTree)(chatId, userId);
    res.status(200).json({
        status: 'success',
        data: tree,
    });
});
