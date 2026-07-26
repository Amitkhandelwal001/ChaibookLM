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
          size: 768, // Gemini text-embedding-004 produces 768-dimensional vectors
          distance: 'Cosine',
        },
      });
      console.log(`Qdrant collection '${COLLECTION_NAME}' created successfully.`);
    } else {
      console.log(`Qdrant collection '${COLLECTION_NAME}' already exists.`);
    }
  } catch (error) {
    console.error('Error initializing Qdrant collection:', error);
  }
};
