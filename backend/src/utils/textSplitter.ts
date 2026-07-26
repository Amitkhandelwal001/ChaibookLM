import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export const splitTextIntoChunks = async (text: string, chunkSize = 1000, chunkOverlap = 200) => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  });

  const chunks = await splitter.createDocuments([text]);
  return chunks.map((chunk) => chunk.pageContent);
};
