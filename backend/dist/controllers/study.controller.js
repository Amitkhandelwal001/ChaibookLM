"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchStudyData = exports.generateMaterials = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const study_service_1 = require("../services/study.service");
const AppError_1 = require("../utils/AppError");
const qdrant_config_1 = require("../config/qdrant.config");
exports.generateMaterials = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { documentId } = req.body;
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    }
    if (!documentId) {
        return res.status(400).json({ status: 'fail', message: 'documentId is required' });
    }
    // Check if they already exist
    const existingNote = await (0, study_service_1.getNotesByDocument)(documentId, userId);
    if (existingNote) {
        return res.status(400).json({ status: 'fail', message: 'Study materials already generated for this document.' });
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
        throw new AppError_1.AppError('Could not find processed text for this document.', 404);
    }
    const result = await (0, study_service_1.generateStudyMaterials)(documentId, userId, documentText);
    res.status(201).json({
        status: 'success',
        data: result,
    });
});
exports.fetchStudyData = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { documentId } = req.params;
    const userId = req.user?.id;
    if (!userId)
        return res.status(401).json({ status: 'fail', message: 'Unauthorized' });
    const note = await (0, study_service_1.getNotesByDocument)(documentId, userId);
    const flashcards = await (0, study_service_1.getFlashcardsByDocument)(documentId, userId);
    res.status(200).json({
        status: 'success',
        data: {
            note,
            flashcards,
        },
    });
});
