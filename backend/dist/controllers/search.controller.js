"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getKnowledgeGraph = exports.globalSearch = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const search_service_1 = require("../services/search.service");
exports.globalSearch = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const query = req.query.q;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    if (!query) {
        return res.status(400).json({ status: 'fail', message: 'Search query is required' });
    }
    const results = await (0, search_service_1.performGlobalSearch)(query, userId);
    res.status(200).json({
        status: 'success',
        data: {
            results,
        },
    });
});
exports.getKnowledgeGraph = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    const graphData = await (0, search_service_1.generateKnowledgeGraph)(userId);
    res.status(200).json({
        status: 'success',
        data: graphData,
    });
});
