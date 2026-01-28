# Amharic AI Support Strategy

## Overview

This document outlines strategies for delivering high-quality Amharic language responses from Vagabond Bible's AI features (Pastor Chat, Smart Search, Verse Insights, Synopsis) while maintaining cost-effective operations.

## Current State

- **AI Provider**: OpenAI GPT-4o-mini
- **Cost**: $0.15 input / $0.60 output per million tokens
- **Amharic Quality**: Functional but sometimes produces literal translations or unnatural phrasing

## AI Provider Cost Comparison (January 2026)

| Model | Input (per 1M) | Output (per 1M) | Amharic Support | Status |
|-------|----------------|-----------------|-----------------|--------|
| **GPT-4o-mini** | $0.15 | $0.60 | Basic | ✅ Active |
| GPT-4o | $2.50 | $10.00 | Good | ✅ Active |
| Gemini 1.5 Flash | $0.10 | $0.40 | Excellent | ❌ Retired Sept 2025 |
| Gemini 2.0 Flash | $0.30 | $2.50 | Excellent | ⚠️ Retiring March 2026 |
| Gemini 2.5 Flash | $0.30 | $2.50 | Excellent | ✅ Active |
| Gemini 3 Flash | $0.50 | $3.00 | Excellent | ✅ Active |

**Key Finding**: GPT-4o-mini is currently the most cost-effective option. Gemini models have better native Amharic support but cost 4-5x more.

---

## Recommended Strategy: Layered Approach

### Phase 1: Prompt Engineering (Free, Immediate)

Enhance the system prompt with explicit Amharic language instructions:

```
When responding in Amharic (አማርኛ):
- Use natural, conversational Amharic - not literal word-for-word translation
- Use proper Ethiopian Orthodox Christian terminology (e.g., "እግዚአብሔር" for God)
- Include Ge'ez script for Bible references and key terms
- Match the warm, pastoral tone appropriate for Ethiopian Christian culture
- When quoting Scripture, use established Amharic Bible translations when possible
- Avoid English loanwords when native Amharic equivalents exist
```

**Implementation**: Update system prompts in:
- `server/replit_integrations/chat/routes.ts` (Pastor Chat)
- Smart Search, Insights, Synopsis handlers

**Effort**: 30 minutes
**Cost**: Free

### Phase 2: Few-Shot Examples (Low Cost)

Include 2-3 high-quality Amharic response examples in the system prompt. GPT learns style and grammar patterns from examples.

Example structure:
```
Here is an example of a good Amharic pastoral response:

User: What does God say about worry?
Assistant: ውድ ወንድም/እህት፣ ስለ ጭንቀት የእግዚአብሔር ቃል ብዙ ይናገራል። በማቴዎስ 6:25-27...
```

**Effort**: 1-2 hours (need native Amharic speaker to verify quality)
**Cost**: Slightly higher token usage (~10-15% more per request)

### Phase 3: Translation Layer (Very Cheap)

If Phases 1-2 are insufficient, add Google Cloud Translation API:

**Flow**:
1. GPT generates response in English
2. Google Translate API converts to Amharic
3. User receives high-quality Amharic

**Google Translate Pricing**:
- $20 per 1 million characters
- ~500 characters per typical AI response = $0.00001 per response
- Extremely cost-effective

**Implementation**:
```typescript
import { TranslationServiceClient } from '@google-cloud/translate';

async function translateToAmharic(text: string): Promise<string> {
  const client = new TranslationServiceClient();
  const [response] = await client.translateText({
    parent: `projects/${PROJECT_ID}/locations/global`,
    contents: [text],
    mimeType: 'text/plain',
    sourceLanguageCode: 'en',
    targetLanguageCode: 'am',
  });
  return response.translations[0].translatedText;
}
```

**Effort**: 3-4 hours
**Cost**: ~$0.01 per 1000 responses

### Phase 4: Hybrid Model Routing (Higher Cost, Best Quality)

Route users by language preference:
- English users → GPT-4o-mini (cheap)
- Amharic users → Gemini 2.5/3 Flash (better native support)

**Rationale**: Only pay premium prices for the user segment that needs it.

**Implementation**:
```typescript
async function getAIResponse(message: string, language: string) {
  if (language === 'am') {
    return geminiFlash(message); // Better Amharic
  }
  return gpt4oMini(message); // Cost-effective for English
}
```

**Effort**: 4-5 hours
**Cost**: Variable based on Amharic user percentage

---

## Decision Matrix

| Approach | Quality | Cost | Effort | Recommended For |
|----------|---------|------|--------|-----------------|
| Prompt Engineering | Medium | Free | Low | Start here |
| Few-Shot Examples | Medium-High | Free | Medium | After Phase 1 |
| Translation Layer | High | Very Low | Medium | If quality still lacking |
| Hybrid Routing | Highest | Variable | High | Large Amharic user base |

---

## Recommended Implementation Order

1. **Immediate**: Implement Phase 1 (prompt engineering) - FREE
2. **Test**: Evaluate Amharic response quality with native speakers
3. **If needed**: Add Phase 2 (few-shot examples)
4. **If still needed**: Implement Phase 3 (translation layer) - very cheap
5. **Future**: Consider Phase 4 if Amharic user base grows significantly

---

## Google Gemini Deprecation Notes

**Important**: Google has aggressive model deprecation cycles:
- Gemini 1.5 models: Retired September 2025
- Gemini 2.0 Flash: Retiring March 31, 2026
- Gemini 2.5 Flash: Currently stable (no announced deprecation)

If using Gemini, plan for model migrations every 6-12 months.

---

## Action Items

- [ ] Update Pastor Chat system prompt with Amharic language instructions
- [ ] Test improved prompts with Ethiopian users/testers
- [ ] Evaluate if translation layer is needed based on feedback
- [ ] Monitor Gemini 2.5/3 pricing for potential future migration

---

*Last Updated: January 2026*
