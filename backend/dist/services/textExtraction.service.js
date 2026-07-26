"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromImage = exports.extractTextFromRaw = exports.extractTextFromPdf = void 0;
const axios_1 = __importDefault(require("axios"));
const pdfParse = require('pdf-parse');
const extractTextFromPdf = async (url) => {
    try {
        const response = await axios_1.default.get(url, { responseType: 'arraybuffer' });
        const dataBuffer = Buffer.from(response.data);
        const pdfData = await pdfParse(dataBuffer);
        return pdfData.text;
    }
    catch (error) {
        console.error('Error extracting text from PDF:', error);
        throw new Error('Failed to parse PDF document.');
    }
};
exports.extractTextFromPdf = extractTextFromPdf;
const extractTextFromRaw = async (url) => {
    try {
        const response = await axios_1.default.get(url, { responseType: 'text' });
        return response.data;
    }
    catch (error) {
        console.error('Error extracting text from raw file:', error);
        throw new Error('Failed to parse raw text document.');
    }
};
exports.extractTextFromRaw = extractTextFromRaw;
// Placeholder for OCR (e.g., Tesseract) in the future
const extractTextFromImage = async (url) => {
    console.log(`Placeholder OCR extraction for Image: ${url}`);
    return 'Placeholder text for image processing.';
};
exports.extractTextFromImage = extractTextFromImage;
