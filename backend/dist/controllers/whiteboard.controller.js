"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listWhiteboardsHandler = exports.getWhiteboardHandler = exports.saveWhiteboardHandler = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const whiteboard_service_1 = require("../services/whiteboard.service");
exports.saveWhiteboardHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, data, id } = req.body;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    if (!data)
        return res.status(400).json({ status: 'fail', message: 'Data is required' });
    const result = await (0, whiteboard_service_1.saveWhiteboard)(userId, title || 'Untitled Whiteboard', data, id);
    res.status(200).json({
        status: 'success',
        data: result,
    });
});
exports.getWhiteboardHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const result = await (0, whiteboard_service_1.getWhiteboard)(id, userId);
    if (!result)
        return res.status(404).json({ status: 'fail', message: 'Whiteboard not found' });
    res.status(200).json({
        status: 'success',
        data: result,
    });
});
exports.listWhiteboardsHandler = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const results = await (0, whiteboard_service_1.getUserWhiteboards)(userId);
    res.status(200).json({
        status: 'success',
        data: results,
    });
});
