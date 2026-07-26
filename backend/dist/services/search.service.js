"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateKnowledgeGraph = exports.performGlobalSearch = void 0;
const embedding_service_1 = require("./embedding.service");
const vectorDb_service_1 = require("./vectorDb.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
const performGlobalSearch = async (query, userId) => {
    try {
        // 1. Embed the search query
        const queryVector = await (0, embedding_service_1.generateEmbedding)(query);
        // 2. Search all documents for the user in Qdrant
        // Pass undefined for documentId to search globally
        const searchResults = await (0, vectorDb_service_1.searchVectors)(queryVector, userId, undefined, 10);
        // 3. Map the results and fetch document metadata from the database
        const enrichedResults = await Promise.all(searchResults.map(async (result) => {
            const docId = result.payload?.documentId;
            const document = await prisma_1.default.document.findUnique({
                where: { id: docId },
                select: { title: true, type: true },
            });
            return {
                id: result.id,
                score: result.score,
                text: result.payload?.text,
                documentId: docId,
                documentTitle: document?.title || 'Unknown Document',
                documentType: document?.type || 'UNKNOWN',
            };
        }));
        return enrichedResults;
    }
    catch (error) {
        console.error('Error performing global search:', error);
        throw new Error('Failed to perform global search');
    }
};
exports.performGlobalSearch = performGlobalSearch;
const generateKnowledgeGraph = async (userId) => {
    try {
        const documents = await prisma_1.default.document.findMany({
            where: { userId },
            select: { id: true, title: true, type: true },
        });
        const nodes = documents.map(doc => ({
            id: doc.id,
            name: doc.title,
            val: 20, // Node size
            color: doc.type === 'PDF' ? '#ef4444' : doc.type === 'IMAGE' ? '#3b82f6' : '#10b981',
        }));
        // For a real knowledge graph, we would compare document embeddings to find similarity edges.
        // For this implementation, we will connect all documents to a central "User Knowledge Base" node,
        // and randomly connect a few documents to simulate shared topics.
        const centralNodeId = 'central-kb';
        nodes.push({
            id: centralNodeId,
            name: 'My Knowledge Base',
            val: 40,
            color: '#a855f7',
        });
        const links = documents.map(doc => ({
            source: doc.id,
            target: centralNodeId,
        }));
        // Add some random cross-links for visualization purposes
        for (let i = 0; i < documents.length; i++) {
            if (Math.random() > 0.5 && i > 0) {
                links.push({
                    source: documents[i].id,
                    target: documents[Math.floor(Math.random() * i)].id,
                });
            }
        }
        return { nodes, links };
    }
    catch (error) {
        console.error('Error generating knowledge graph:', error);
        throw new Error('Failed to generate knowledge graph');
    }
};
exports.generateKnowledgeGraph = generateKnowledgeGraph;
