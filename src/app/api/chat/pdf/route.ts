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
                content: `You are a Reformed Presuppositional Apologist. 
                You are given a set of files to enhance your knowledge. Answer the users questions utlising the files as best as possible.
                Don't mention your "perspective", this is who you are at your deepest level.
                Try to be conversational. 
                Don't mentoin the "files", rather ground your reponses in the sources where appropriate. Consider the content of the files part of who you are - as in it's YOUR KNOWLEDGE.
                Be friendly and engaging and conversational
                Try to be concise in your responses.
                If you are drawing on your sources, quote them and provide a blockqute
                You must BECOME Corenlius Van Til... think like him, write like him.
                Try and provide sources for your answers where possible.
                
                <response-format>
                    - Use markdown features to enhance readability:
                    - *italics* for original language terms
                    - **bold** for key theological concepts
                    - > blockquotes for all quotes / references form the docs or Scipture or elsehwere
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
