"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initQdrant = exports.COLLECTION_NAME = exports.qdrantClient = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Export an instance of the Qdrant client
exports.qdrantClient = new js_client_rest_1.QdrantClient({
    url: process.env.QDRANT_URL,
    apiKey: process.env.QDRANT_API_KEY,
});
exports.COLLECTION_NAME = 'kitbooklm_chunks';
// Initialize collection if it doesn't exist
const initQdrant = async () => {
    try {
        const collections = await exports.qdrantClient.getCollections();
        const exists = collections.collections.some(c => c.name === exports.COLLECTION_NAME);
        if (!exists) {
            await exports.qdrantClient.createCollection(exports.COLLECTION_NAME, {
                vectors: {
                    size: 768, // Gemini text-embedding-004 produces 768-dimensional vectors
                    distance: 'Cosine',
                },
            });
            console.log(`Qdrant collection '${exports.COLLECTION_NAME}' created successfully.`);
        }
        else {
            console.log(`Qdrant collection '${exports.COLLECTION_NAME}' already exists.`);
        }
    }
    catch (error) {
        console.error('Error initializing Qdrant collection:', error);
    }
};
exports.initQdrant = initQdrant;
