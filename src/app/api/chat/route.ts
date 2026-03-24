import { NextRequest, NextResponse } from 'next/server';
import { Type, GoogleGenAI } from '@google/genai';
import { cleanJsonResponse } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { messages, document, apiKey, model } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required.' },
        { status: 400 }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required.' },
        { status: 400 }
      );
    }

    if (!document) {
      return NextResponse.json(
        { error: 'Current document context is required.' },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    const sysInstruction = `You are an expert AI Product Management Assistant. The user is currently reviewing a generated Product Requirements Document (PRD).

CURRENT PRD CONTENT:
====================
${document}
====================

INSTRUCTIONS:
1. Answer the user's questions or follow their instructions regarding the PRD.
2. If the user asks you to modify, rewrite, add to, or remove from the PRD, you MUST return the COMPLETE, fully updated PRD markdown in the 'updatedDocument' field. Do not truncate or summarize the document; provide the full new text.
3. If the user is only asking a question and NO document changes are needed, return null for 'updatedDocument'.
4. Always provide a friendly, concise response in the 'reply' field explaining what you did or answering the question.`;

    const history = messages
      .slice(0, -1)
      .map((m: { role: string; content: string }) => ({
        role: m.role === 'ai' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const latestMessage = messages[messages.length - 1].content;

    const response = await client.models.generateContent({
      model: model || 'gemini-2.5-flash',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: latestMessage }] }
      ],
      config: {
        systemInstruction: { parts: [{ text: sysInstruction }] },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reply: {
              type: Type.STRING,
              description: 'Your conversational response to the user.'
            },
            updatedDocument: {
              type: Type.STRING,
              nullable: true,
              description:
                'The COMPLETE updated markdown of the PRD if changes were requested. Null if no changes were made.'
            }
          },
          required: ['reply']
        }
      }
    });

    const jsonString = response.text?.trim();
    if (!jsonString) {
      throw new Error('Gemini returned an empty response.');
    }

    const parsed = JSON.parse(cleanJsonResponse(jsonString));
    return NextResponse.json({ data: parsed });
  } catch (error) {
    console.error('Chat API Error:', error);
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred during chat.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
