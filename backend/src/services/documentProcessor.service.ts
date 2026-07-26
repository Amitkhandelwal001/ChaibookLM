import { getDocumentById } from '../repositories/document.repository';
import { extractTextFromPdf, extractTextFromRaw, extractTextFromImage } from './textExtraction.service';
import { splitTextIntoChunks } from '../utils/textSplitter';
import { generateEmbeddingsBatch } from './embedding.service';
import { upsertVectors } from './vectorDb.service';
import { Document } from '@prisma/client';

export const processDocumentBackground = async (documentId: string, userId: string) => {
  console.log(`Starting background processing for document: ${documentId}`);

  try {
    const document = await getDocumentById(documentId, userId);
    if (!document) {
      console.error(`Document ${documentId} not found`);
      return;
    }

    let extractedText = '';

    // Step 1: Extract Text based on Document Type or Extension
    const fileExtension = document.title.split('.').pop()?.toLowerCase();

    if (fileExtension === 'pdf') {
      extractedText = await extractTextFromPdf(document.url);
    } else if (fileExtension === 'docx') {
      const { extractTextFromDocx } = require('./textExtraction.service');
      extractedText = await extractTextFromDocx(document.url);
    } else if (['txt', 'md', 'csv'].includes(fileExtension || '')) {
      extractedText = await extractTextFromRaw(document.url);
    } else if (document.type === 'IMAGE') {
      extractedText = await extractTextFromImage(document.url);
    } else {
      console.warn(`Unsupported extraction for file type: ${fileExtension}`);
      return;
    }

    if (!extractedText || extractedText.trim().length === 0) {
      console.warn(`No text could be extracted from document ${documentId}`);
      return;
    }

    console.log(`Extracted ${extractedText.length} characters from ${document.title}`);

    // Step 2: Split into chunks
    const chunks = await splitTextIntoChunks(extractedText, 1000, 200);
    console.log(`Split text into ${chunks.length} chunks`);

    // Step 3: Generate Embeddings and push to Qdrant
    if (chunks.length > 0) {
      // Process in batches of 100 to avoid hitting API limits
      const BATCH_SIZE = 100;
      for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
        const batchChunks = chunks.slice(i, i + BATCH_SIZE);
        
        console.log(`Generating embeddings for batch ${i / BATCH_SIZE + 1}...`);
        const embeddings = await generateEmbeddingsBatch(batchChunks);
        
        const payloads = batchChunks.map((text, index) => ({
          documentId,
          userId,
          chunkIndex: i + index,
          text,
        }));

        await upsertVectors(embeddings, payloads);
      }
    }

    console.log(`Successfully processed and embedded document ${documentId}.`);

  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error);
  }
};
