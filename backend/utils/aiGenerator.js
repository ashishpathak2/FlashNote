import fetch from 'node-fetch';

// !! API key is read at call-time (not module load time) so it always reflects
// the value dotenv loaded into process.env
function getApiKey() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error('OPENROUTER_API_KEY is not set in environment variables');
  return key;
}

// The free model on OpenRouter as requested
const MODEL = 'openai/gpt-3.5-turbo';

// Valid card types — anything the AI returns outside this list gets normalised to 'concept'
const VALID_TYPES = new Set(['concept', 'definition', 'example', 'relationship', 'edge-case', 'formula']);

function sanitiseType(raw) {
  if (!raw) return 'concept';
  const lower = String(raw).toLowerCase().trim();
  return VALID_TYPES.has(lower) ? lower : 'concept';
}

function sanitiseCard(c) {
  return {
    front: String(c.front || '').trim(),
    back:  String(c.back  || '').trim(),
    hint:  String(c.hint  || '').trim(),
    type:  sanitiseType(c.type),
    tags:  Array.isArray(c.tags) ? c.tags.map(t => String(t)).filter(Boolean) : [],
  };
}

export async function generateFlashcardsFromText(text, deckTitle, pageCount = 0) {
  const apiKey = getApiKey();

  const estimatedPages = pageCount || Math.ceil(text.length / 2500);
  const minCards   = Math.max(10, estimatedPages * 2);
  const targetCards = Math.min(Math.max(minCards, estimatedPages * 3), 120); // cap at 120

  // Keep text within safe token range — step-3.5 context window
  const truncated = text.substring(0, 24000);

  console.log(`[AI] Generating cards for "${deckTitle}"`);
  console.log(`[AI] Pages: ${estimatedPages}, Target cards: ${targetCards}, Text length: ${truncated.length}`);
  console.log(`[AI] Model: ${MODEL}`);

  const systemPrompt = `You are a brilliant study buddy creating flashcards that help people actually learn — not robotic textbook definitions, but real plain-English explanations.

Style rules:
- Write like a smart friend explaining things simply
- Front: a natural question someone would ask
- Back: a friendly, clear explanation with context — explain the WHY and HOW
- Hint: optional nudge (empty string if not useful)
- Type MUST be exactly one of: concept, definition, example, relationship, edge-case, formula
- Cover every major topic and subtopic in the content
- Keep language simple, conversational, easy to remember`;

  const userPrompt = `Create flashcards for a deck titled "${deckTitle}".

Document is ~${estimatedPages} pages. Generate approximately ${targetCards} cards covering every topic and subtopic.

CONTENT:
---
${truncated}
---

RESPOND WITH ONLY VALID JSON — no markdown, no backticks, no extra text before or after:
{"cards":[{"front":"question","back":"answer","hint":"","type":"concept","tags":["tag"]}],"subject":"subject name","summary":"one sentence summary"}`;

  let response;
  try {
    response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Mnemo Flashcards',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 8192,
        temperature: 0.4,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      }),
      // 90 second timeout for large PDFs
      signal: AbortSignal.timeout(90_000),
    });
  } catch (err) {
    console.error('[AI] Network/timeout error:', err.message);
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('AI request timed out. Try with a smaller PDF or try again.');
    }
    throw new Error(`Network error reaching AI service: ${err.message}`);
  }

  if (!response.ok) {
    const errText = await response.text().catch(() => 'unknown error');
    console.error(`[AI] API error ${response.status}:`, errText);

    if (response.status === 401) throw new Error('Invalid OpenRouter API key. Check your OPENROUTER_API_KEY in .env');
    if (response.status === 402) throw new Error('OpenRouter account has no credits. Add credits at openrouter.ai');
    if (response.status === 429) throw new Error('Rate limit hit. Please wait a moment and try again.');
    if (response.status === 503) throw new Error(`Model "${MODEL}" is unavailable. Check openrouter.ai for available models.`);
    throw new Error(`AI service error (${response.status}): ${errText.substring(0, 200)}`);
  }

  const data = await response.json();
  console.log('[AI] Response received. Usage:', data.usage);

  const raw = data.choices?.[0]?.message?.content?.trim();
  if (!raw) {
    console.error('[AI] Empty response:', JSON.stringify(data));
    throw new Error('AI returned an empty response. Please try again.');
  }

  console.log('[AI] Raw response length:', raw.length);
  console.log('[AI] First 200 chars:', raw.substring(0, 200));

  // Strip any accidental markdown fences
  let clean = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (parseErr) {
    console.error('[AI] JSON parse failed. Attempting extraction...');
    // Try to extract JSON object from the string
    const match = clean.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        parsed = JSON.parse(match[0]);
        console.log('[AI] JSON extracted successfully via regex');
      } catch (e2) {
        console.error('[AI] Regex extraction also failed:', e2.message);
        console.error('[AI] Raw content:', clean.substring(0, 500));
        throw new Error('AI response was not valid JSON. Please try again.');
      }
    } else {
      console.error('[AI] No JSON found in response');
      throw new Error('AI did not return flashcard data. Please try again.');
    }
  }

  if (!parsed.cards || !Array.isArray(parsed.cards) || parsed.cards.length === 0) {
    console.error('[AI] No cards in response:', JSON.stringify(parsed).substring(0, 300));
    throw new Error('AI generated no cards from this content. The PDF may be too short or unreadable.');
  }

  // Sanitise all cards — fix types, remove empty cards
  const validCards = parsed.cards
    .map(sanitiseCard)
    .filter(c => c.front.length > 0 && c.back.length > 0);

  if (validCards.length === 0) {
    throw new Error('AI generated cards had no valid content. Please try again.');
  }

  console.log(`[AI] ✓ Generated ${validCards.length} valid cards`);

  return {
    cards:   validCards,
    subject: parsed.subject || 'General',
    summary: parsed.summary || '',
  };
}
