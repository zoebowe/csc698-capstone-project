import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------
// 0) OpenAI setup (generation only, NO embeddings)
// ---------------------------------------------------------

const openaiApiKey = process.env.OPENAI_API_KEY;
const COMPLETION_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

let openaiClient = null;

if (!openaiApiKey) {
  console.warn("No OPENAI_API_KEY found. Using mock responses only.");
} else {
  openaiClient = new OpenAI({ apiKey: openaiApiKey });
  console.log(`OpenAI client initialized with model ${COMPLETION_MODEL}`);
}

// ---------------------------------------------------------
// 1) Basic Express setup
// ---------------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ---------------------------------------------------------
// 2) Load & CHUNK medical corpus for retrieval (RAG)
// ---------------------------------------------------------

function chunkText(text, maxChars = 800, overlap = 150) {
  const chunks = [];
  if (!text) return chunks;

  let start = 0;
  while (start < text.length) {
    const end = Math.min(text.length, start + maxChars);
    const slice = text.slice(start, end).trim();
    if (slice.length > 0) {
      chunks.push(slice);
    }
    if (end >= text.length) break;
    start = Math.max(0, end - overlap);
  }
  return chunks;
}

let rawCorpus = [];
let medicalCorpus = []; // expanded into chunks

try {
  const corpusPath = path.join(__dirname, "data", "medical_corpus.json");
  const raw = fs.readFileSync(corpusPath, "utf8");
  rawCorpus = JSON.parse(raw);
  console.log(`Loaded raw medical corpus with ${rawCorpus.length} entries.`);

  rawCorpus.forEach((doc) => {
    const chunks = chunkText(doc.text);
    chunks.forEach((chunkText, idx) => {
      medicalCorpus.push({
        id: `${doc.id}_chunk_${idx + 1}`,
        source: doc.source,
        title: doc.title,
        url: doc.url,
        text: chunkText
      });
    });
  });

  console.log(`Expanded corpus into ${medicalCorpus.length} chunks.`);
} catch (err) {
  console.warn(
    "Could not load data/medical_corpus.json. RAG will be disabled and only generic answers will be used.",
    err.message
  );
  rawCorpus = [];
  medicalCorpus = [];
}

// ---------------------------------------------------------
// 3) Lexical tokenizer + Jaccard retrieval (RAG)
// ---------------------------------------------------------

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2);
}

const corpusWithTokens = medicalCorpus.map((doc) => ({
  ...doc,
  tokens: new Set(tokenize(doc.text))
}));

function jaccardSimilarity(setA, setB) {
  let intersection = 0;
  const unionSize = new Set([...setA, ...setB]).size;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection++;
    }
  }
  return unionSize === 0 ? 0 : intersection / unionSize;
}

function retrieveRelevantPassages(question, k = 3) {
  if (!corpusWithTokens.length || !question) return [];

  const qTokens = new Set(tokenize(question));

  const scored = corpusWithTokens
    .map((doc) => ({
      doc,
      score: jaccardSimilarity(qTokens, doc.tokens)
    }))
    .filter((item) => item.score > 0);

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((item) => item.doc);
}

// ---------------------------------------------------------
// 4) Conversation memory (single-session, in-memory)
// ---------------------------------------------------------

const MAX_TURNS = 6;
let conversationHistory = [];

function addToHistory(role, content) {
  conversationHistory.push({ role, content });
  if (conversationHistory.length > MAX_TURNS * 2) {
    conversationHistory = conversationHistory.slice(-MAX_TURNS * 2);
  }
}

function buildHistoryBlock() {
  if (!conversationHistory.length) return "No previous conversation.";
  return conversationHistory
    .map((turn) =>
      turn.role === "user"
        ? `User: ${turn.content}`
        : `Assistant: ${turn.content}`
    )
    .join("\n");
}

// ---------------------------------------------------------
// 5) Shared mock response (when OpenAI is missing or errors)
// ---------------------------------------------------------

function buildBaseSourcesFromCorpus() {
  if (!medicalCorpus || !medicalCorpus.length) {
    return ["CDC", "Mayo Clinic", "MedlinePlus"];
  }

  const uniqueSources = [];
  const seen = new Set();

  for (const doc of medicalCorpus) {
    if (!seen.has(doc.source)) {
      seen.add(doc.source);
      uniqueSources.push(doc.source);
    }
    if (uniqueSources.length >= 3) break;
  }

  return uniqueSources;
}

function buildMockResponse(question, isFallback = false) {
  const baseSources = buildBaseSourcesFromCorpus();

  return {
    answer:
      "Here is a general, non-diagnostic explanation based on common medical guidance. " +
      "Because this is a demo, the information may be incomplete. For personalized advice, talk to a licensed healthcare provider.\n\n" +
      `You asked: '${question}'. Reputable organizations such as CDC, Mayo Clinic, and MedlinePlus emphasize lifestyle support, monitoring symptoms, and seeking timely care for red-flag signs like trouble breathing, chest pain, or sudden confusion.`,
    sources: baseSources,
    disclaimer:
      (isFallback
        ? "The main model is temporarily unavailable, so this answer is based on a static template and may be less accurate. "
        : "") +
      "This chatbot does NOT provide medical diagnoses or treatment. It is for general informational purposes only. " +
      "Always consult a licensed healthcare professional for questions about your own health, and call emergency services in urgent situations.",
    followUps: []
  };
}

function buildSourcesFromRetrieved(retrieved, maxSources = 2) {
  if (!retrieved || !retrieved.length) {
    return buildBaseSourcesFromCorpus();
  }

  const unique = [];
  const seen = new Set();

  for (const doc of retrieved) {
    if (!seen.has(doc.source)) {
      seen.add(doc.source);
      unique.push(doc.source);
    }
    if (unique.length >= maxSources) break;
  }

  return unique.length ? unique : buildBaseSourcesFromCorpus();
}

// ---------------------------------------------------------
// 6) /ask endpoint with RAG + conversation
// ---------------------------------------------------------

app.post("/ask", async (req, res) => {
  const { question } = req.body || {};

  if (!question || typeof question !== "string") {
    return res
      .status(400)
      .json({ error: "Missing 'question' field in request body." });
  }

  addToHistory("user", question);

  if (!openaiClient) {
    const mock = buildMockResponse(question);
    addToHistory("assistant", mock.answer);
    return res.json(mock);
  }

  try {
    // 6a) Retrieve relevant passages
    const retrieved = retrieveRelevantPassages(question, 3);

    // 6b) Summarize RAG context
    let ragSummary = "No clearly relevant documents were found in the corpus.";
    if (retrieved.length) {
      const summaryPrompt = `
You are summarizing trusted medical reference snippets.

Task:
- Combine the information into a short, neutral medical brief.
- Focus only on facts that are clearly stated in the snippets.
- Keep it under 120 words.
- Do NOT add new facts or speculate.

Snippets:
${retrieved
  .map(
    (doc, idx) =>
      `(${idx + 1}) [${doc.source}] ${doc.title}: ${doc.text}`
  )
  .join("\n\n")}
      `.trim();

      const summaryResult = await openaiClient.responses.create({
        model: COMPLETION_MODEL,
        input: summaryPrompt
      });

      ragSummary = (summaryResult.output_text || "").trim();
    }

    // 6c) Main conversational prompt with NEW system instructions

    const systemInstruction = `
You are a calm, empathetic medical information assistant.

STYLE:
- Speak in a natural, conversational tone, like a helpful nurse educator.
- Let the length of your response depend on the complexity of the question.
- Simple questions should get concise answers (about one short paragraph).
- More complex or sensitive questions may need 2–3 short paragraphs and, if helpful, a short bullet list.
- Use bullet points only when they genuinely improve clarity.
- Avoid unnecessary repetition or boilerplate phrasing.

SAFETY RULES:
- You provide general, evidence-based health information only.
- You are NOT a doctor and do NOT give diagnoses, medical advice, or treatment plans.
- Never tell the user what condition they 'have' or claim that their symptoms prove a specific disease.
- You may explain when it is reasonable to contact a clinician, urgent care, or emergency services, and why.
- Mention emergency warning signs ONLY when they clearly apply to the question.
- Never provide medication dosages or prescribe medication.
- Never invent or speculate beyond established medical knowledge.
- If information is uncertain or depends on individual factors, clearly say that you cannot know for sure and recommend talking to a clinician.

WORKFLOW:
- Answer the user’s question in SIMPLE HTML using <p> and, when useful, <ul><li>...</li></ul>.
- Let the answer length match the question complexity.
- Try to stay under about 250 words unless extra detail is clearly helpful.
- Do NOT use markdown or code fences.
    `.trim();

    const historyBlock = buildHistoryBlock();

    const mainPrompt = `
${systemInstruction}

Conversation so far:
${historyBlock}

Summarized medical context from trusted sources:
${ragSummary}

User's latest question:
'${question}'

Using ONLY the information above (do not invent new facts), do the following:

1) Write a friendly, conversational answer in SIMPLE HTML:
   - Use <p> tags for short paragraphs.
   - You may include a <ul><li>...</li></ul> list only if it genuinely helps readability.
   - Do NOT force fixed section headings in every answer.
   - Mention seeking medical or urgent care only when it reasonably fits the situation.
   - Let the length depend on how complex the question is, but try not to exceed about 250 words.
   - Do NOT include any double quote characters (") inside the HTML; use plain text and single quotes only. Do not use HTML attributes.

2) Suggest up to 2 natural follow-up questions the user might ask next. If none feel natural, return an empty list.

Return your response as valid JSON with this exact shape:

{
  "answer": "<p>HTML answer here with optional <ul><li>...</li></ul></p>",
  "follow_ups": ["short follow-up question 1", "short follow-up question 2"]
}

Remember:
- The value of 'answer' must be a SINGLE HTML string (no markdown, no code fences).
- Do NOT put any double quote characters inside that string, so the JSON stays valid.
    `.trim();

    const result = await openaiClient.responses.create({
      model: COMPLETION_MODEL,
      input: mainPrompt
    });

    const rawText = (result.output_text || "").trim();

    // 6d) Parse JSON
    let answer = rawText;
    let followUps = [];

    try {
      const firstBrace = rawText.indexOf("{");
      const lastBrace = rawText.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonSlice = rawText.slice(firstBrace, lastBrace + 1);
        const parsed = JSON.parse(jsonSlice);

        if (parsed && typeof parsed.answer === "string") {
          answer = parsed.answer;
        }
        if (Array.isArray(parsed.follow_ups)) {
          followUps = parsed.follow_ups.filter(
            (q) => typeof q === "string" && q.trim().length > 0
          );
        }
      }
    } catch (parseErr) {
      console.warn(
        "Could not parse JSON from OpenAI response, using raw text.",
        parseErr.message
      );
    }

    addToHistory("assistant", answer);

    const sources = buildSourcesFromRetrieved(retrieved, 2);

    const responsePayload = {
      answer,
      sources,
      disclaimer:
        "This chatbot provides general health information and is NOT a substitute for professional medical advice, diagnosis, or treatment. " +
        "Always talk to a licensed healthcare provider about your own health, and call emergency services in urgent situations.",
      followUps
    };

    console.log(
      `POST /ask 200 - question='${question.slice(
        0,
        80
      )}...' (retrieved ${retrieved.length} chunks)`
    );

    return res.json(responsePayload);
  } catch (err) {
    console.error("Error in /ask with OpenAI/RAG:", err);
    const fallback = buildMockResponse(question, true);
    addToHistory("assistant", fallback.answer);
    return res.json(fallback);
  }
});

// ---------------------------------------------------------
// 7) Reset conversation endpoint
// ---------------------------------------------------------

app.post("/reset", (req, res) => {
  conversationHistory = [];
  return res.json({ ok: true, message: "Conversation history cleared." });
});

// ---------------------------------------------------------
// 8) Start server
// ---------------------------------------------------------

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});