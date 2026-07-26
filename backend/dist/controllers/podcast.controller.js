"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchPodcasts = exports.generatePodcast = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const podcast_service_1 = require("../services/podcast.service");
const AppError_1 = require("../utils/AppError");
const qdrant_config_1 = require("../config/qdrant.config");
exports.generatePodcast = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { documentId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    if (!documentId) {
        return res.status(400).json({ status: 'fail', message: 'documentId is required' });
    }
    // Fetch the full document context from Qdrant
    const searchResult = await qdrant_config_1.qdrantClient.scroll(qdrant_config_1.COLLECTION_NAME, {
        filter: {
            must: [
                { key: 'userId', match: { value: userId } },
                { key: 'documentId', match: { value: documentId } },
            ],
        },
        limit: 100,
        with_payload: true,
    });
    const documentText = searchResult.points
        .map(p => p.payload?.text)
        .filter(Boolean)
        .join('\n\n');
    if (!documentText) {
        throw new AppError_1.AppError('Could not find processed text for this document. Please ensure it was processed successfully.', 404);
    }
    // Generate and store
    const podcast = await (0, podcast_service_1.generateAndStorePodcast)(documentId, userId, documentText);
    res.status(201).json({
        status: 'success',
        data: {
            podcast,
        },
    });
});
exports.fetchPodcasts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    const podcasts = await (0, podcast_service_1.getUserPodcasts)(userId);
    res.status(200).json({
        status: 'success',
        data: {
            podcasts,
        },
    });
});
