import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable');
}

const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

// Initialize the clients with credentials
const ttsClient = new TextToSpeechClient({ credentials });
const storage = new Storage({ credentials });
const bucket = storage.bucket('bible_study_audio');

// Function to split text into chunks by sections and sentences
function splitIntoChunks(text: string): string[] {
    // First split by major sections (numbered points and double newlines)
    const sections = text.split(/(?=\d\.\s|(?:\r?\n){2,})/);

    const chunks: string[] = [];
    let currentChunk = '';

    for (const section of sections) {
        // Split section into sentences
        const sentences = section.split(/(?<=[.!?])\s+/);

        for (const sentence of sentences) {
            // If adding this sentence would exceed the limit, start a new chunk
            if ((currentChunk + sentence).length > 4000) { // Using 4000 to be safe
                if (currentChunk) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            } else {
                currentChunk += (currentChunk ? ' ' : '') + sentence;
            }
        }
    }

    // Add the last chunk if there is one
    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

export async function POST(request: NextRequest) {
    try {
        const { text, studyId, checkOnly } = await request.json();

        // Check if audio already exists
        const audioFile = bucket.file(`${studyId}.mp3`);
        const [exists] = await audioFile.exists();

        if (exists) {
            // Get the signed URL for the existing audio file
            const [url] = await audioFile.getSignedUrl({
                version: 'v4',
                action: 'read',
                expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
            });
            return NextResponse.json({ audioUrl: url });
        }

        // If this is just a check, return null
        if (checkOnly) {
            return NextResponse.json({ audioUrl: null });
        }

        // Proceed with audio generation if we have text
        if (!text) {
            return NextResponse.json(
                { error: 'No text provided for audio generation' },
                { status: 400 }
            );
        }

        const chunks = splitIntoChunks(text);

        // Process each chunk and collect the audio
        const audioPromises = chunks.map(async (chunk) => {
            const request_config = {
                input: { text: chunk },
                voice: {
                    languageCode: 'en-US',
                    name: 'en-US-Polyglot-1',
                    ssmlGender: 'MALE' as const,
                },
                audioConfig: {
                    audioEncoding: 'MP3' as const,
                    speakingRate: 0.9,
                    pitch: 0,
                    volumeGainDb: 0,
                },
            };

            const [response] = await ttsClient.synthesizeSpeech(request_config);
            const audioContent = response.audioContent;

            if (!audioContent) {
                throw new Error('No audio content generated');
            }

            return Buffer.from(audioContent as Uint8Array);
        });

        // Wait for all chunks to be processed and concatenate them
        const audioBuffers = await Promise.all(audioPromises);
        const concatenatedBuffer = Buffer.concat(audioBuffers);

        // Upload to Google Cloud Storage
        await audioFile.save(concatenatedBuffer, {
            metadata: {
                contentType: 'audio/mp3',
            },
        });

        // Get a signed URL for the uploaded file
        const [url] = await audioFile.getSignedUrl({
            version: 'v4',
            action: 'read',
            expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
        });

        return NextResponse.json({ audioUrl: url });
    } catch (error) {
        console.error('Error in text-to-speech processing:', error);
        return NextResponse.json(
            { error: 'Failed to process text-to-speech request' },
            { status: 500 }
        );
    }
} 
