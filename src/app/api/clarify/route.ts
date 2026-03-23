import { NextRequest, NextResponse } from 'next/server';
import { Type, GoogleGenAI } from '@google/genai';
import { getContextHeader } from '../_lib/datetime';

export async function POST(request: NextRequest) {
  try {
    const { productIdea, images, productMode, apiKey, model } =
      (await request.json()) as {
        productIdea?: string;
        images?: Array<{
          id: string;
          name: string;
          type: string;
          size: number;
          data: string;
        }>;
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

    if (!productIdea || !productIdea.trim()) {
      return NextResponse.json(
        { error: 'Product idea is required.' },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });

    // Build image context if images are provided
    let imageContext = '';
    if (images && images.length > 0) {
      imageContext =
        '\n\nVisual Context: The user has also provided the following images to help illustrate their product idea:\n';
      images.forEach((img, index) => {
        imageContext += `\n${index + 1}. Image: ${img.name} (${img.type}, ${(img.size / 1024 / 1024).toFixed(1)}MB)\n`;
        imageContext += `   [Note: This is a base64 encoded image that provides visual context for the product idea]`;
      });
    }

    const modeInstructions = productMode
      ? `Specifically tailored for a ${productMode} product.`
      : '';

    const basePrompt = `You are a brilliant product strategist. A user has provided a high-level product idea for a ${productMode || 'new product'}. Your task is to analyze this idea and identify 3-4 critical pieces of information that are missing or would significantly improve the quality of a Product Requirements Document (PRD).

User's Idea: "${productIdea}"${imageContext}

${modeInstructions}

Generate 3-4 targeted, open-ended questions that will help clarify the product's vision, unique value proposition, specific user needs, or technical constraints. Keep the questions concise and professional.

Return the response as a JSON object with a 'questions' array.`;

    // Add current date/time context to the prompt
    const promptWithContext = getContextHeader() + basePrompt;

    const response = await client.models.generateContent({
      model: model || 'gemini-flash-latest',
      contents: promptWithContext,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            questions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['questions']
        }
      }
    });

    const jsonString = response.text?.trim();
    if (!jsonString) {
      throw new Error(
        'Gemini returned an empty response while generating clarification questions.'
      );
    }

    const parsed = JSON.parse(jsonString);
    return NextResponse.json({ data: parsed.questions || [] });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while generating clarification questions.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
