import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

// Export an instance of the Qdrant client
export const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

export const COLLECTION_NAME = 'kitbooklm_chunks';

// Initialize collection if it doesn't exist
export const initQdrant = async () => {
  try {
    const collections = await qdrantClient.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
      await qdrantClient.createCollection(COLLECTION_NAME, {
        vectors: {
          size: 1536, // OpenAI text-embedding-3-small produces 1536-dimensional vectors
          distance: 'Cosine',
        },
      });
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'userId',
        field_schema: 'keyword',
      });
      await qdrantClient.createPayloadIndex(COLLECTION_NAME, {
        field_name: 'documentId',
        field_schema: 'keyword',
      });
      console.log(`Qdrant collection '${COLLECTION_NAME}' created successfully with indices.`);
    } else {
      console.log(`Qdrant collection '${COLLECTION_NAME}' already exists.`);
    }
  } catch (error) {
    console.error('Error initializing Qdrant collection:', error);
  }
};
