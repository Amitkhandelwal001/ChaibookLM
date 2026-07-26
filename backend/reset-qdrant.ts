import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function run() {
  await qdrantClient.deleteCollection('kitbooklm_chunks');
  console.log('Deleted old collection');
}

run().catch(console.error);
