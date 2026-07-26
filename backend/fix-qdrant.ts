import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
dotenv.config();

const qdrantClient = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

async function run() {
  await qdrantClient.createPayloadIndex('kitbooklm_chunks', {
    field_name: 'userId',
    field_schema: 'keyword',
  });
  console.log('Created payload index for userId');
}

run().catch(console.error);
