// src/services/aiAnalyzer.test.ts
import { parseAIResponse, buildPrompt } from './aiAnalyzer'

it('parseAIResponse extracts valid JSON from AI output', () => {
  const raw = `Here is my analysis:
\`\`\`json
{
  "keywords": ["bold", "energetic"],
  "mood": "energetic",
  "suggestedDesignFormats": ["brutalist", "flat"],
  "suggestedStyles": {
    "borderRadius": "sharp",
    "shadows": "none",
    "typography": "bold"
  }
}
\`\`\``
  const result = parseAIResponse(raw)
  expect(result.keywords).toEqual(['bold', 'energetic'])
  expect(result.suggestedDesignFormats).toHaveLength(2)
})

it('parseAIResponse throws on invalid JSON', () => {
  expect(() => parseAIResponse('no json here')).toThrow()
})

it('buildPrompt returns a non-empty string', () => {
  expect(buildPrompt(['#ffffff', '#000000'])).toMatch(/color/i)
})
