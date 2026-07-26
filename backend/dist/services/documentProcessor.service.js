"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processDocumentBackground = void 0;
const document_repository_1 = require("../repositories/document.repository");
const textExtraction_service_1 = require("./textExtraction.service");
const textSplitter_1 = require("../utils/textSplitter");
const embedding_service_1 = require("./embedding.service");
const vectorDb_service_1 = require("./vectorDb.service");
const processDocumentBackground = async (documentId, userId) => {
    console.log(`Starting background processing for document: ${documentId}`);
    try {
        const document = await (0, document_repository_1.getDocumentById)(documentId, userId);
        if (!document) {
            console.error(`Document ${documentId} not found`);
            return;
        }
        let extractedText = '';
        // Step 1: Extract Text based on Document Type or Extension
        const fileExtension = document.title.split('.').pop()?.toLowerCase();
        if (fileExtension === 'pdf') {
            extractedText = await (0, textExtraction_service_1.extractTextFromPdf)(document.url);
        }
        else if (['txt', 'md', 'csv'].includes(fileExtension || '')) {
            extractedText = await (0, textExtraction_service_1.extractTextFromRaw)(document.url);
        }
        else if (document.type === 'IMAGE') {
            extractedText = await (0, textExtraction_service_1.extractTextFromImage)(document.url);
        }
        else {
            console.warn(`Unsupported extraction for file type: ${fileExtension}`);
            return;
        }
        if (!extractedText || extractedText.trim().length === 0) {
            console.warn(`No text could be extracted from document ${documentId}`);
            return;
        }
        console.log(`Extracted ${extractedText.length} characters from ${document.title}`);
        // Step 2: Split into chunks
        const chunks = await (0, textSplitter_1.splitTextIntoChunks)(extractedText, 1000, 200);
        console.log(`Split text into ${chunks.length} chunks`);
        // Step 3: Generate Embeddings and push to Qdrant
        if (chunks.length > 0) {
            // Process in batches of 100 to avoid hitting API limits
            const BATCH_SIZE = 100;
            for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
                const batchChunks = chunks.slice(i, i + BATCH_SIZE);
                console.log(`Generating embeddings for batch ${i / BATCH_SIZE + 1}...`);
                const embeddings = await (0, embedding_service_1.generateEmbeddingsBatch)(batchChunks);
                const payloads = batchChunks.map((text, index) => ({
                    documentId,
                    userId,
                    chunkIndex: i + index,
                    text,
                }));
                await (0, vectorDb_service_1.upsertVectors)(embeddings, payloads);
            }
        }
        console.log(`Successfully processed and embedded document ${documentId}.`);
    }
    catch (error) {
        console.error(`Error processing document ${documentId}:`, error);
    }
};
exports.processDocumentBackground = processDocumentBackground;
