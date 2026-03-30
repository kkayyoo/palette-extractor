// src/services/aiAnalyzer.ts
import type { DesignFormat, SuggestedStyles } from '../types'

export interface AIAnalysisResult {
  keywords: string[]
  mood: string
  suggestedDesignFormats: [DesignFormat, DesignFormat]
  suggestedStyles: SuggestedStyles
}

export function buildPrompt(hexColors: string[]): string {
  if (hexColors.length === 0) throw new Error('buildPrompt requires at least one color')
  return `You are a design expert. Analyze these color palette hexes: ${hexColors.join(', ')}.
Return ONLY a JSON code block with this exact structure:
\`\`\`json
{
  "keywords": ["word1", "word2", "word3"],
  "mood": "one word mood",
  "suggestedDesignFormats": ["format1", "format2"],
  "suggestedStyles": {
    "borderRadius": "sharp|rounded|pill",
    "shadows": "none|subtle|soft|dramatic",
    "typography": "modern|classic|friendly|bold"
  }
}
\`\`\`
Valid design formats: minimalist, brutalist, flat, glassmorphism, neumorphism, retro, organic, skeuomorphic.`
}

export function parseAIResponse(raw: string): AIAnalysisResult {
  const match = raw.match(/```json\s*([\s\S]*?)\n```/)
  if (!match) throw new Error('No JSON block found in AI response')
  return JSON.parse(match[1]) as AIAnalysisResult
}

export async function analyzeColors(
  hexColors: string[],
  imageBase64: string | null,
  apiKey: string
): Promise<AIAnalysisResult> {
  const messages: { role: string; content: unknown }[] = [
    {
      role: 'user',
      content: imageBase64
        ? [
            { type: 'text', text: buildPrompt(hexColors) },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
          ]
        : buildPrompt(hexColors),
    },
  ]

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: 'gpt-4o', messages, max_tokens: 1024 }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI error ${res.status}: ${body}`)
  }
  const data = await res.json()
  const choice = data.choices?.[0]
  if (!choice || choice.message?.content == null) {
    throw new Error(`OpenAI returned no content (finish_reason: ${choice?.finish_reason ?? 'unknown'})`)
  }
  const content: string = choice.message.content
  return parseAIResponse(content)
}
