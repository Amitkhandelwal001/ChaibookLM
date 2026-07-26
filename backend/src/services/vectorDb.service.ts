import { qdrantClient, COLLECTION_NAME } from '../config/qdrant.config';
import { v4 as uuidv4 } from 'uuid';

export interface ChunkPayload {
  documentId: string;
  userId: string;
  chunkIndex: number;
  text: string;
}

export const upsertVectors = async (vectors: number[][], payloads: ChunkPayload[]) => {
  if (vectors.length !== payloads.length) {
    throw new Error('Vectors and payloads must have the same length');
  }

  const points = vectors.map((vector, index) => ({
    id: uuidv4(),
    vector,
    payload: {
      ...payloads[index],
    },
  }));

  try {
    await qdrantClient.upsert(COLLECTION_NAME, {
      wait: true,
      points,
    });
    console.log(`Successfully upserted ${points.length} vectors into Qdrant.`);
  } catch (error) {
    console.error('Error upserting vectors to Qdrant:', error);
    throw new Error('Failed to upsert vectors');
  }
};

export const searchVectors = async (queryVector: number[], userId: string, documentId?: string, limit = 5) => {
  try {
    // Build the filter conditions
    const mustConditions: any[] = [
      { key: 'userId', match: { value: userId } }
    ];

    if (documentId) {
      mustConditions.push({ key: 'documentId', match: { value: documentId } });
    }

    const searchResult = await qdrantClient.search(COLLECTION_NAME, {
      vector: queryVector,
      filter: {
        must: mustConditions,
      },
      limit,
      with_payload: true,
    });

    return searchResult;
  } catch (error) {
    console.error('Error searching vectors in Qdrant:', error);
    throw new Error('Failed to search vectors');
  }
};
