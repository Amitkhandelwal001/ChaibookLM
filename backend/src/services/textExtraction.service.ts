import axios from 'axios';
const pdfParse = require('pdf-parse');

export const extractTextFromPdf = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const dataBuffer = Buffer.from(response.data);
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to parse PDF document.');
  }
};

export const extractTextFromRaw = async (url: string): Promise<string> => {
  try {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data as string;
  } catch (error) {
    console.error('Error extracting text from raw file:', error);
    throw new Error('Failed to parse raw text document.');
  }
};

// Placeholder for OCR (e.g., Tesseract) in the future
export const extractTextFromImage = async (url: string): Promise<string> => {
  console.log(`Placeholder OCR extraction for Image: ${url}`);
  return 'Placeholder text for image processing.';
};
