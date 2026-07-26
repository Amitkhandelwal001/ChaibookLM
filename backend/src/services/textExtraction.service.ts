import axios from 'axios';
const pdfParse = require('pdf-parse');

export const extractTextFromPdf = async (urlOrPath: string): Promise<string> => {
  try {
    let dataBuffer: Buffer;
    if (urlOrPath.startsWith('http')) {
      const response = await axios.get(urlOrPath, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else {
      const fs = require('fs');
      dataBuffer = fs.readFileSync(urlOrPath);
    }
    const pdfData = await pdfParse(dataBuffer);
    return pdfData.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to parse PDF document.');
  }
};

export const extractTextFromDocx = async (urlOrPath: string): Promise<string> => {
  try {
    let dataBuffer: Buffer;
    if (urlOrPath.startsWith('http')) {
      const response = await axios.get(urlOrPath, { responseType: 'arraybuffer' });
      dataBuffer = Buffer.from(response.data);
    } else {
      const fs = require('fs');
      dataBuffer = fs.readFileSync(urlOrPath);
    }
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer: dataBuffer });
    return result.value;
  } catch (error) {
    console.error('Error extracting text from DOCX:', error);
    throw new Error('Failed to parse DOCX document.');
  }
};

export const extractTextFromRaw = async (urlOrPath: string): Promise<string> => {
  try {
    if (urlOrPath.startsWith('http')) {
      const response = await axios.get(urlOrPath, { responseType: 'text' });
      return response.data as string;
    } else {
      const fs = require('fs');
      return fs.readFileSync(urlOrPath, 'utf8');
    }
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
