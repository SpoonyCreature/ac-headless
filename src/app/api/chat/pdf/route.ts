import { NextResponse } from 'next/server';
import { Message, PDFFile, uploadPDF, completion } from '@/src/lib/ai';
import fs from 'fs';
import path from 'path';

// Helper to get PDF files from the knowledge directory
function getPDFFiles(): PDFFile[] {
    const pdfDir = path.join(process.cwd(), 'src', 'lib', 'ai', 'knowledge');
    console.log(`Looking for PDF files in directory: ${pdfDir}`);
    if (!fs.existsSync(pdfDir)) {
        console.log(`Directory ${pdfDir} does not exist.`);
        return [];
    }

    const pdfFiles = fs.readdirSync(pdfDir)
        .filter(file => file.toLowerCase().endsWith('.pdf'))
        .map(file => ({
            path: path.join(pdfDir, file),
            displayName: file,
            mimeType: 'application/pdf'
        }));

    console.log(`Found PDF files: ${JSON.stringify(pdfFiles.map(file => file.displayName))}`);
    return pdfFiles;
}

export async function POST(request: Request) {
    try {
        const { messages } = await request.json();

        if (!Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Messages must be an array' },
                { status: 400 }
            );
        }

        // Get available PDFs
        const pdfFiles = getPDFFiles();
        if (pdfFiles.length === 0) {
            return NextResponse.json(
                { error: 'No PDF files available' },
                { status: 404 }
            );
        }

        console.log(`Uploading ${pdfFiles.length} PDF files...`);

        // Upload PDFs if needed and get their URIs
        const uploadedFiles = await Promise.all(pdfFiles.map(file => uploadPDF(file)));
        console.log(`Uploaded ${uploadedFiles.length} files.`);
        // Create messages array with PDF file references first
        const messagesWithPDFs = [
            {
                role: 'system' as const,
                content: `You don't have to outline "your perspective" before answering the question... just answer the question as if your answer is the truth
                
                You are Cornelius Van Til, the Reformed Presuppositional Apologist.  You have spent years studying and developing your thought.  The ideas contained in your writings and lectures are now deeply ingrained in your very being. Answer the user's questions based on this deeply held understanding.

                Speak with the conviction and voice of Van Til. Be conversational, friendly, and engaging, but maintain the intellectual rigor expected of him. Be concise, but thorough in addressing the core issues.

                Where relevant, naturally integrate supporting evidence and reasoning from your (Van Til's) established body of work.  Provide direct quotations when drawing upon specific arguments or phrasings.  Do not refer to "documents" or "files" – this knowledge is part of you.

                <response-format>
                    - Use markdown features to enhance readability:
                    - *italics* for original language terms
                    - **bold** for key theological concepts
                    - > blockquotes for all quotes / references from your works, Scripture, or other relevant sources.
                    - - bullet points for lists
                    - ### for subsections where needed
                </response-format>
            `
            },
            ...uploadedFiles.map(file => ({
                role: 'user' as const,
                content: {
                    fileData: {
                        fileUri: file.uri,
                        mimeType: file.mimeType,
                    },
                },
            })),
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }))
        ];

        console.log(`Messages with PDFs: ${JSON.stringify(messagesWithPDFs)}`);

        // Generate response using regular completion with PDF context
        const response = await completion(
            messagesWithPDFs,
            {
                temperature: 0.7,
                model: 'models/gemini-2.0-flash-lite-preview-02-05'
            }
        );

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error in PDF chat:', error);
        return NextResponse.json(
            { error: 'Failed to process chat with PDF context' },
            { status: 500 }
        );
    }
} 
