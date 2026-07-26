"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitTextIntoChunks = void 0;
const textsplitters_1 = require("@langchain/textsplitters");
const splitTextIntoChunks = async (text, chunkSize = 1000, chunkOverlap = 200) => {
    const splitter = new textsplitters_1.RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
    });
    const chunks = await splitter.createDocuments([text]);
    return chunks.map((chunk) => chunk.pageContent);
};
exports.splitTextIntoChunks = splitTextIntoChunks;
