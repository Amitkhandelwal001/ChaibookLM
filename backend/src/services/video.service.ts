import { YoutubeTranscript } from 'youtube-transcript';
import OpenAI from 'openai';
import { AppError } from '../utils/AppError';

// Initialize OpenAI client (requires OPENAI_API_KEY in .env)
const openai = new OpenAI();

export const extractVideoHighlights = async (youtubeUrl: string) => {
  try {
    // 1. Fetch Transcript
    const transcriptLines = await YoutubeTranscript.fetchTranscript(youtubeUrl);
    
    if (!transcriptLines || transcriptLines.length === 0) {
      throw new AppError('Could not fetch transcript for this video. It may not have closed captions.', 400);
    }

    // Combine transcript into a chunked format for the AI
    // We include timestamps so the AI knows when things happen
    let transcriptText = '';
    for (const line of transcriptLines) {
      // Offset is in milliseconds
      const seconds = Math.floor(line.offset / 1000);
      transcriptText += `[${seconds}s]: ${line.text}\n`;
    }

    // Limit length if it's too long (OpenAI has 128k context, so we are usually fine, but let's cap at 100k chars just in case)
    if (transcriptText.length > 100000) {
      transcriptText = transcriptText.substring(0, 100000) + '... (truncated)';
    }

    // 2. Call OpenAI using Structured Outputs
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert video analyst. Given a video transcript with timestamps in brackets like [120s], your job is to extract 5 to 10 key highlights/moments from the video. Return them as a JSON array."
        },
        {
          role: "user",
          content: `Here is the transcript:\n\n${transcriptText}`
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "video_highlights",
          schema: {
            type: "object",
            properties: {
              highlights: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    timestampSeconds: {
                      type: "number",
                      description: "The exact starting timestamp in seconds for this highlight"
                    },
                    formattedTime: {
                      type: "string",
                      description: "The formatted timestamp, e.g., '12:05'"
                    },
                    title: {
                      type: "string",
                      description: "A short, catchy title for this highlight"
                    },
                    summary: {
                      type: "string",
                      description: "A 1-2 sentence summary of what happens in this highlight"
                    }
                  },
                  required: ["timestampSeconds", "formattedTime", "title", "summary"],
                  additionalProperties: false
                }
              }
            },
            required: ["highlights"],
            additionalProperties: false
          },
          strict: true
        }
      },
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new AppError('Failed to generate highlights', 500);
    }

    const parsed = JSON.parse(content);
    return parsed.highlights;

  } catch (error: any) {
    console.error('Video processing error:', error);
    if (error instanceof AppError) throw error;
    throw new AppError(error.message || 'Error processing video highlights', 500);
  }
};
