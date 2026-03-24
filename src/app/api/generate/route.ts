import { NextRequest, NextResponse } from 'next/server';
import { buildGenerationPrompt, PrdInput } from '../../../lib/prd';
import { GoogleGenAI } from '@google/genai';
import { getContextHeader } from '../_lib/datetime';
import { z } from 'zod';

const prdInputSchema = z.object({
  productName: z.string(),
  targetAudience: z.string(),
  problemStatement: z.string(),
  proposedSolution: z.string(),
  coreFeatures: z.string(),
  keyFeatures: z.string(),
  businessGoals: z.string(),
  successMetrics: z.string(),
  futureFeatures: z.string(),
  techStack: z.string(),
  constraints: z.string(),
  timeline: z.string(),
  budget: z.string(),
  productMode: z.union([
    z.literal('SaaS Product'),
    z.literal('AI Product'),
    z.literal('Mobile App'),
    z.literal('Feature Enhancement')
  ]).optional().default('SaaS Product'),
  currentState: z.string().optional(),
  proposedChanges: z.string().optional(),
  productIdeaImages: z.array(z.any()).optional()
});

export async function POST(request: NextRequest) {
  try {
    const { inputs, apiKey, model } = await request.json();

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json(
        { error: 'API key is required.' },
        { status: 400 }
      );
    }

    const parseResult = prdInputSchema.safeParse(inputs);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid PRD inputs provided.', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const client = new GoogleGenAI({ apiKey });
    const basePrompt = buildGenerationPrompt(parseResult.data as PrdInput);

    // Add current date/time context to the prompt
    const promptWithContext = getContextHeader() + basePrompt;

    const response = await client.models.generateContent({
      model: model || 'gemini-flash-latest',
      contents: promptWithContext
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error(
        'Gemini returned an empty response while generating the PRD.'
      );
    }

    return NextResponse.json({ data: { prd: text } });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'An unknown error occurred while generating the PRD.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
