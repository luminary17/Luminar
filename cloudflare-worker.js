const ALLOWED_ORIGINS = new Set([
  'https://luminary17.github.io',
  'http://127.0.0.1:8012',
  'http://localhost:8012'
]);

const CHAT_MODEL = 'gemini-3.1-flash-lite';
const ASSESSMENT_MODEL = 'gemini-3.7-flash';
const MAX_ANSWERS = 12;
const MAX_BASE64_CHARS = 18_000_000;
const MAX_CHAT_MESSAGES = 12;

function isAllowedOrigin(origin) {
  return ALLOWED_ORIGINS.has(origin) || /^http:\/\/(127\.0\.0\.1|localhost):\d{2,5}$/.test(origin);
}

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': isAllowedOrigin(origin) ? origin : 'https://luminary17.github.io',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin'
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

function band(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Math.max(0, Math.min(9, Math.round(number * 2) / 2));
}

function cleanText(value, maximum) {
  return String(value || '').trim().slice(0, maximum);
}

function extractAssistantText(result) {
  return result?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || '')
    .join('')
    .trim();
}

function validateChatMessages(input) {
  if (!Array.isArray(input) || input.length < 1) throw new Error('Say something first.');
  return input.slice(-MAX_CHAT_MESSAGES).map((message) => {
    const role = message?.role === 'model' ? 'model' : 'user';
    const text = cleanText(message?.text, 1200);
    if (!text) throw new Error('A conversation message is empty.');
    return { role, parts: [{ text }] };
  });
}

async function chat(request, env, origin) {
  if (!env.GEMINI_API_KEY) return json({ error: 'The conversation service is not configured.' }, 503, origin);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Send a valid JSON request.' }, 400, origin);
  }

  let contents;
  try {
    contents = validateChatMessages(payload.messages);
  } catch (error) {
    return json({ error: error.message }, 400, origin);
  }

  const interviewMode = payload.mode === 'ielts-speaking';
  const sessionComplete = Boolean(payload.sessionComplete);
  const nextQuestion = cleanText(payload.nextQuestion, 900);
  const systemText = interviewMode
    ? 'You are Luminary, a calm IELTS Speaking examiner. React to the student’s latest answer with one natural acknowledgement of two to six words. Do not ask a question, give feedback, correct the student, provide a score, or mention any provider or model. Always reply in English and use plain text only.'
    : 'You are Luminary, a friendly English conversation partner for students. Your name is Luminary. Never mention the underlying provider, model, or technical implementation. Always reply in English. Respond naturally in one or two short sentences, normally under 45 words. Continue the conversation with a brief relevant follow-up question when appropriate. Do not score, assess, correct, or use markdown unless the student explicitly asks.';

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000);
  let aiResponse;
  try {
    aiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${CHAT_MODEL}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': env.GEMINI_API_KEY
        },
        signal: controller.signal,
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: systemText }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: 140,
            thinkingConfig: { thinkingLevel: 'minimal' }
          }
        })
      }
    );
  } catch (error) {
    if (error?.name === 'AbortError') return json({ error: 'Luminary took too long to reply. Please try again.' }, 504, origin);
    return json({ error: 'Luminary could not connect right now.' }, 502, origin);
  } finally {
    clearTimeout(timeout);
  }

  const aiResult = await aiResponse.json().catch(() => ({}));
  if (!aiResponse.ok) {
    const message = aiResponse.status === 429 ? 'Luminary is busy right now. Please try again shortly.' : 'Luminary could not reply right now.';
    return json({ error: message }, aiResponse.status === 429 ? 429 : 502, origin);
  }

  let reply = cleanText(extractAssistantText(aiResult), 1200).replace(/\bGemini\b/gi, 'Luminary');
  if (interviewMode && sessionComplete) reply = 'Thank you. That is the end of your speaking mock.';
  if (interviewMode && !nextQuestion) reply = cleanText(reply, 120);
  if (!reply) return json({ error: 'Luminary returned an empty reply.' }, 502, origin);
  return json({ reply }, 200, origin);
}

function validateAnswers(input) {
  if (!Array.isArray(input) || input.length < 3 || input.length > MAX_ANSWERS) {
    throw new Error(`Submit between 3 and ${MAX_ANSWERS} Part 1 answers.`);
  }

  let totalBase64 = 0;
  return input.map((answer, index) => {
    const question = cleanText(answer?.question, 500);
    const audioBase64 = String(answer?.audioBase64 || '').replace(/^data:[^;]+;base64,/, '');
    const mimeType = cleanText(answer?.mimeType, 80).toLowerCase();
    const durationSeconds = Math.max(1, Math.min(120, Number(answer?.durationSeconds) || 0));
    totalBase64 += audioBase64.length;

    if (!question) throw new Error(`Question ${index + 1} is missing.`);
    if (!audioBase64 || !/^[a-zA-Z0-9+/=]+$/.test(audioBase64)) {
      throw new Error(`Audio ${index + 1} is invalid.`);
    }
    if (!/^audio\/(webm|ogg|mpeg|mp3|wav|mp4|x-m4a|aac)/.test(mimeType)) {
      throw new Error(`Audio format ${index + 1} is not supported.`);
    }

    return { question, audioBase64, mimeType, durationSeconds };
  }).map((answer) => {
    if (totalBase64 > MAX_BASE64_CHARS) throw new Error('The complete recording is too large.');
    return answer;
  });
}

function buildPrompt(answerCount) {
  return `You are a careful IELTS Speaking practice assessor. Evaluate the candidate only from the ${answerCount} IELTS Speaking Part 1 question-and-audio pairs that follow.

Use the public IELTS Speaking criteria: Fluency and Coherence, Lexical Resource, Grammatical Range and Accuracy, and Pronunciation. Treat this as an estimated practice result, not an official IELTS score. Judge pronunciation from the audio, not merely from an inferred transcript. Do not reward accent similarity; judge intelligibility and appropriate phonological control. Consider the whole session and do not score isolated answers independently.

Return JSON only with exactly this structure:
{
  "fluency": 0,
  "vocabulary": 0,
  "grammar": 0,
  "pronunciation": 0,
  "confidence": 0,
  "summary": "",
  "strengths": [""],
  "priorities": [""]
}

Rules:
- Criterion scores must be from 0 to 9 in 0.5 increments.
- confidence must be from 0 to 1.
- summary must be one short sentence.
- strengths: at most 2 short items.
- priorities: at most 3 specific short items.
- Do not include an overall score; the server calculates it.
- Reduce confidence when audio is unclear, the session is too short, or evidence is insufficient.`;
}

async function assess(request, env, origin) {
  if (!env.GEMINI_API_KEY) return json({ error: 'The assessment service is not configured.' }, 503, origin);

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Send a valid JSON request.' }, 400, origin);
  }

  let answers;
  try {
    answers = validateAnswers(payload.answers);
  } catch (error) {
    return json({ error: error.message }, 400, origin);
  }

  const parts = [{ text: buildPrompt(answers.length) }];
  answers.forEach((answer, index) => {
    parts.push({ text: `Question ${index + 1}: ${answer.question}\nRecorded answer duration: ${answer.durationSeconds} seconds.` });
    parts.push({ inlineData: { mimeType: answer.mimeType, data: answer.audioBase64 } });
  });

  const aiResponse = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${ASSESSMENT_MODEL}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          thinkingConfig: { thinkingLevel: 'low' },
          responseMimeType: 'application/json'
        }
      })
    }
  );

  const aiResult = await aiResponse.json().catch(() => ({}));
  if (!aiResponse.ok) {
    const message = aiResponse.status === 429 ? 'Luminary is busy right now. Please try again shortly.' : 'Luminary could not assess this session.';
    return json({ error: message }, aiResponse.status === 429 ? 429 : 502, origin);
  }

  let raw;
  try {
    raw = JSON.parse(extractAssistantText(aiResult));
  } catch {
    return json({ error: 'The assessment response was invalid. Please try again.' }, 502, origin);
  }

  const scores = {
    fluency: band(raw.fluency),
    vocabulary: band(raw.vocabulary),
    grammar: band(raw.grammar),
    pronunciation: band(raw.pronunciation)
  };
  if (Object.values(scores).some((score) => score === null)) {
    return json({ error: 'The assessment did not contain valid scores.' }, 502, origin);
  }

  const overall = band(Object.values(scores).reduce((sum, score) => sum + score, 0) / 4);
  return json({
    assessment: {
      overall,
      ...scores,
      confidence: Math.max(0, Math.min(1, Number(raw.confidence) || 0)),
      summary: cleanText(raw.summary, 300),
      strengths: Array.isArray(raw.strengths) ? raw.strengths.slice(0, 2).map((item) => cleanText(item, 180)).filter(Boolean) : [],
      priorities: Array.isArray(raw.priorities) ? raw.priorities.slice(0, 3).map((item) => cleanText(item, 180)).filter(Boolean) : [],
      scope: 'IELTS Speaking Part 1 practice estimate'
    }
  }, 200, origin);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get('Origin') || '';

    if (request.method === 'OPTIONS') {
      if (!isAllowedOrigin(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    if (url.pathname === '/') {
      return json({ service: 'Luminary Speaking AI', status: 'ready' }, 200, origin);
    }

    if (url.pathname === '/speaking/analyze' && request.method === 'POST') {
      if (!isAllowedOrigin(origin)) return json({ error: 'Origin not allowed.' }, 403, origin);
      return assess(request, env, origin);
    }

    if (url.pathname === '/speaking/chat' && request.method === 'POST') {
      if (!isAllowedOrigin(origin)) return json({ error: 'Origin not allowed.' }, 403, origin);
      return chat(request, env, origin);
    }

    return json({ error: 'Not found.' }, 404, origin);
  }
};
