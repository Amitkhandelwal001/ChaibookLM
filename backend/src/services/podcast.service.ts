import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import prisma from '../utils/prisma';
import cloudinary from '../config/cloudinary.config';
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const generatePodcastScript = async (contextText: string): Promise<string> => {
  const prompt = `You are an expert podcast host named Kit. 
I am going to provide you with some study notes or a document. 
Your job is to rewrite this material into an incredibly engaging, enthusiastic, conversational podcast script.
It should sound like an excited host explaining a fascinating topic to a friend.
Do not use any formatting like **bold** or bullet points, and do not include speaker tags like "Host:". Just write the plain spoken text that the voice actor will read.
Make it around 2-3 minutes spoken (approx 400-500 words).

Material to adapt:
${contextText}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text || '';
};

const synthesizeAudio = async (text: string): Promise<Buffer> => {
  if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.includes('your_')) {
    throw new Error('ElevenLabs API Key is missing or invalid.');
  }

  // Voice ID for "Rachel" (a standard ElevenLabs voice)
  const voiceId = '21m00Tcm4TlvDq8ikWAM'; 
  
  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    },
    {
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': ELEVENLABS_API_KEY,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    }
  );

  return Buffer.from(response.data);
};

export const generateAndStorePodcast = async (documentId: string, userId: string, documentText: string) => {
  try {
    console.log(`Generating podcast script for document ${documentId}...`);
    const script = await generatePodcastScript(documentText);
    
    if (!script) throw new Error('Failed to generate script');

    console.log('Synthesizing audio with ElevenLabs...');
    const audioBuffer = await synthesizeAudio(script);

    console.log('Uploading audio to Cloudinary...');
    // We upload buffers to cloudinary using a stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video', // Audio files use 'video' in Cloudinary
          folder: `kitbooklm/podcasts/${userId}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(audioBuffer);
    });

    const cloudinaryUrl = (uploadResult as any).secure_url;
    
    // Calculate approximate duration based on word count (approx 150 words per minute)
    const wordCount = script.split(' ').length;
    const durationSeconds = Math.round((wordCount / 150) * 60);

    console.log('Saving podcast to database...');
    const document = await prisma.document.findUnique({ where: { id: documentId }});

    const podcast = await prisma.podcast.create({
      data: {
        title: `${document?.title || 'Document'} Podcast`,
        audioUrl: cloudinaryUrl,
        duration: durationSeconds,
        documentId,
        userId,
      },
    });

    return podcast;
  } catch (error) {
    console.error('Podcast generation error:', error);
    throw error;
  }
};

export const getUserPodcasts = async (userId: string) => {
  return await prisma.podcast.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};
