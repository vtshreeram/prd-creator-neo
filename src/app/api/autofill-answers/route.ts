import { NextRequest, NextResponse } from 'next/server';
import { Type, GoogleGenAI } from '@google/genai';
import { getContextHeader } from '../_lib/datetime';

export async function POST(request: NextRequest) {
  try {
    const { productIdea, questions, productMode, apiKey, model } =
      (await request.json()) as {
        productIdea: string;
        questions: string[];
        productMode?: string;
        apiKey?: string;
        model?: string;
      };

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required.' },
        { status: 400 }
      );
    }

    if (!productIdea || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: 'Product idea and questions are required.' },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    const modeInstructions = productMode
      ? `Specifically tailor the answers for a ${productMode}.`
      : '';

    const basePrompt = `You are an expert Product Manager. A user has provided a high-level product idea.

Product Idea: "${productIdea}"

We have identified a few clarification questions that need to be answered to build a better Product Requirements Document (PRD):
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

${modeInstructions}

Based on the product idea, typical industry patterns, and your product management expertise, generate plausible, highly professional, and concise answers to each of these questions. Extrapolate intelligently to fill in the gaps and make the product concept stronger.

Return the response strictly as a JSON object containing an 'answers' array of strings, where each string corresponds directly to the question at the same index.`;

    const promptWithContext = getContextHeader() + basePrompt;

    const response = await client.models.generateContent({
      model: model || 'gemini-flash-latest',
      contents: promptWithContext,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answers: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['answers']
        }
      }
    });

    const jsonString = response.text?.trim();
    if (!jsonString) {
      throw new Error(
        'Gemini returned an empty response while generating answers.'
      );
    }

    const parsed = JSON.parse(jsonString);
    return NextResponse.json({ data: parsed.answers || [] });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while auto-filling answers.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
