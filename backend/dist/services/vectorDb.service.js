"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchVectors = exports.upsertVectors = void 0;
const qdrant_config_1 = require("../config/qdrant.config");
const uuid_1 = require("uuid");
const upsertVectors = async (vectors, payloads) => {
    if (vectors.length !== payloads.length) {
        throw new Error('Vectors and payloads must have the same length');
    }
    const points = vectors.map((vector, index) => ({
        id: (0, uuid_1.v4)(),
        vector,
        payload: {
            ...payloads[index],
        },
    }));
    try {
        await qdrant_config_1.qdrantClient.upsert(qdrant_config_1.COLLECTION_NAME, {
            wait: true,
            points,
        });
        console.log(`Successfully upserted ${points.length} vectors into Qdrant.`);
    }
    catch (error) {
        console.error('Error upserting vectors to Qdrant:', error);
        throw new Error('Failed to upsert vectors');
    }
};
exports.upsertVectors = upsertVectors;
const searchVectors = async (queryVector, userId, documentId, limit = 5) => {
    try {
        // Build the filter conditions
        const mustConditions = [
            { key: 'userId', match: { value: userId } }
        ];
        if (documentId) {
            mustConditions.push({ key: 'documentId', match: { value: documentId } });
        }
        const searchResult = await qdrant_config_1.qdrantClient.search(qdrant_config_1.COLLECTION_NAME, {
            vector: queryVector,
            filter: {
                must: mustConditions,
            },
            limit,
            with_payload: true,
        });
        return searchResult;
    }
    catch (error) {
        console.error('Error searching vectors in Qdrant:', error);
        throw new Error('Failed to search vectors');
    }
};
exports.searchVectors = searchVectors;
