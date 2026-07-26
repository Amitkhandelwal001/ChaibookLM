"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPodcasts = exports.generateAndStorePodcast = void 0;
const genai_1 = require("@google/genai");
const axios_1 = __importDefault(require("axios"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const cloudinary_config_1 = __importDefault(require("../config/cloudinary.config"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const generatePodcastScript = async (contextText) => {
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
const synthesizeAudio = async (text) => {
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.includes('your_')) {
        throw new Error('ElevenLabs API Key is missing or invalid.');
    }
    // Voice ID for "Rachel" (a standard ElevenLabs voice)
    const voiceId = '21m00Tcm4TlvDq8ikWAM';
    const response = await axios_1.default.post(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
        },
    }, {
        headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
};
const generateAndStorePodcast = async (documentId, userId, documentText) => {
    try {
        console.log(`Generating podcast script for document ${documentId}...`);
        const script = await generatePodcastScript(documentText);
        if (!script)
            throw new Error('Failed to generate script');
        console.log('Synthesizing audio with ElevenLabs...');
        const audioBuffer = await synthesizeAudio(script);
        console.log('Uploading audio to Cloudinary...');
        // We upload buffers to cloudinary using a stream
        const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary_config_1.default.uploader.upload_stream({
                resource_type: 'video', // Audio files use 'video' in Cloudinary
                folder: `kitbooklm/podcasts/${userId}`,
            }, (error, result) => {
                if (error)
                    reject(error);
                else
                    resolve(result);
            });
            uploadStream.end(audioBuffer);
        });
        const cloudinaryUrl = uploadResult.secure_url;
        // Calculate approximate duration based on word count (approx 150 words per minute)
        const wordCount = script.split(' ').length;
        const durationSeconds = Math.round((wordCount / 150) * 60);
        console.log('Saving podcast to database...');
        const document = await prisma_1.default.document.findUnique({ where: { id: documentId } });
        const podcast = await prisma_1.default.podcast.create({
            data: {
                title: `${document?.title || 'Document'} Podcast`,
                audioUrl: cloudinaryUrl,
                duration: durationSeconds,
                documentId,
                userId,
            },
        });
        return podcast;
    }
    catch (error) {
        console.error('Podcast generation error:', error);
        throw error;
    }
};
exports.generateAndStorePodcast = generateAndStorePodcast;
const getUserPodcasts = async (userId) => {
    return await prisma_1.default.podcast.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};
exports.getUserPodcasts = getUserPodcasts;
