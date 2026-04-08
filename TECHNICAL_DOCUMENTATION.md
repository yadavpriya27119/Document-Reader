# PDF Reader — Technical Documentation

A full-stack **Retrieval-Augmented Generation (RAG)** application: users upload a document, the system indexes it in a vector store, and a **Gemini**-powered chat answers questions using retrieved context—with **response caching**, **optional streaming UX**, and **session-scoped conversation memory**.

---

## 1. Project Overview

### What the system does

1. **Ingest**: Accepts PDF, DOCX, or TXT uploads, extracts text, splits it into overlapping chunks, embeds chunks, and stores vectors in **Pinecone** (replacing prior vectors in the configured namespace for a single-document workflow).
2. **Query**: Accepts natural-language questions, retrieves the most similar chunks, and generates an answer **grounded in those excerpts** via the Google Generative AI (Gemini) API.
3. **Optimize**: Reuses identical questions (normalized) via an in-memory **cache (CAG)** when there is no active conversation history.
4. **Remember**: Maintains per-session **chat history** (user / assistant turns) and injects trimmed history into the prompt for follow-up questions.

### Key features

| Area | Feature |
|------|---------|
| **RAG** | Semantic search over document chunks (`topK` retrieval, configurable in code). |
| **CAG** | In-memory key-value cache on normalized question text. |
| **LLM** | Gemini completion with explicit “use only excerpts” behavior. |
| **Streaming** | HTTP streaming of plain text (`text/plain`) for progressive UI (server emits full answer in word-sized chunks). |
| **Memory** | Session ID (`sessionId` / `X-Chat-Session`) with bounded turn count and character budget for history. |
| **UI** | React + Vite + Tailwind + Framer Motion: upload flow, progress animation, 3D-style flip to chat, animated reply bubbles. |

---

## 2. Architecture Diagram (Text-Based)

```
┌─────────────┐     HTTPS / JSON / multipart      ┌──────────────────────────────────────────────┐
│   Browser   │ ─────────────────────────────────►│           Express Backend (Node.js)           │
│  (React UI) │                                   │  ┌────────────┐  ┌────────────┐  ┌──────────┐  │
└─────────────┘                                   │  │  Upload    │  │   Chat     │  │  Cache   │  │
       ▲                                          │  │ controller │  │ controller │  │  routes  │  │
       │                                          │  └─────┬──────┘  └─────┬──────┘  └──────────┘  │
       │  Vite dev proxy: /upload, /chat, …       │        │             │                         │
       └──────────────────────────────────────────│        ▼             ▼                         │
                                                  │  extract → chunk → embed ──► Pinecone upsert   │
                                                  │                        │                      │
                                                  │  question ──► embed ──► Pinecone query          │
                                                  │        │                      │                │
                                                  │        └──────► build prompt (history + RAG)   │
                                                  │                      │                        │
                                                  │                      ▼                        │
                                                  │               Gemini generateContent          │
                                                  │                      │                        │
                                                  │        ◄─────────────┴──────── JSON or stream   │
└─────────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

**Data flow (chat):** User question → (optional) cache lookup → embedding query → Pinecone `query` → concatenate chunk texts as **context** → **prompt** (system + history + excerpts + question) → Gemini → answer → append to session memory; cache write only when no prior history.

---

## 3. System Flow (Step-by-Step)

### 3.1 Upload flow

1. User selects a file on **UploadScreen** (drop zone or file picker).
2. Frontend calls `POST /upload` with `multipart/form-data` field `file` (see `documentsApi.js` / XHR for upload progress).
3. **Multer** provides an in-memory buffer to **upload controller**.
4. **Extraction** (`extraction.service.js`): PDF via `pdf-parse`, DOCX via JSZip + `word/document.xml` stripping, TXT as UTF-8.
5. Validation: minimum extracted length (e.g. 50 chars); otherwise error (common for scanned PDFs without OCR).
6. **Chunking** (`chunking.service.js`): fixed window with overlap (default size `1000`, overlap `200`).
7. **Embedding** (`embedding.service.js`): Gemini embedding model, batched with delays to respect rate limits.
8. **Vector store** (`vectorStore.service.js`): `deleteAll` on namespace (best-effort), then batched `upsert` with metadata `{ text }`.
9. Response: JSON with `success`, `filename`, `characters`, `chunks`.
10. UI: **UploadScreen** completes → `App` flips to **ChatScreen** with the filename.

### 3.2 Processing flow (server-side indexing)

Same as steps 4–8 above: extract → chunk → `embedMany` → Pinecone upsert. Logging reports chunk counts and upsert progress.

### 3.3 Chat query flow

1. User submits a question on **ChatScreen**.
2. Frontend sends `POST /chat` with JSON `{ question, sessionId? }` (and optional `stream: true` for streaming mode). Session may also be sent as header `X-Chat-Session`.
3. If no `sessionId` is provided, the server creates one and echoes it in **`X-Chat-Session`** and JSON body (`sessionId`).
4. **chat.service** `runChat`:
   - Loads **prior** turns for that session (not including the current question yet).
   - If there is **no** prior history: checks **chat cache** on normalized question; on hit, returns cached answer (`source: 'cache'`).
   - If there **is** prior history: **skips cache** (avoid wrong answers on follow-ups).
   - Builds a **retrieval query** from last user message + current question (helps pronouns / “it”).
   - `querySimilarText` → joined chunk texts as **context**.
   - `answerFromContext` builds full prompt and calls Gemini.
   - On miss path without history: **writes** answer to cache.
5. Response:
   - **JSON**: `{ answer, source, sessionId }` where `source` is `cache` or `llm`.
   - **Stream**: `Content-Type: text/plain`, headers `X-Chat-Source`, `X-Chat-Session`; body streamed word-by-word.

### 3.4 Memory integration flow

1. Before generation: `getPriorTurns(sessionId)` supplies history for the prompt only.
2. After generation completes:
   - **Non-streaming**: append `(question, answer)` immediately after `runChat`.
   - **Streaming**: append only after `streamPlainText` finishes writing the full string (same final text as non-stream).
3. **Trimming**: enforced by max turn count and max history characters when formatting (see §5.4).
4. **Start fresh** (UI): clears server session memory (`DELETE /chat/session?sessionId=...`), clears chat cache (`DELETE /cache`), rotates client `sessionId` in `localStorage`.

---

## 4. Tech Stack

### Frontend

| Technology | Role |
|------------|------|
| **React 19** | UI components and state. |
| **Vite 6** | Dev server, build, API proxy to backend. |
| **Tailwind CSS 4** | Styling (`@tailwindcss/vite`). |
| **Framer Motion** | Upload/chat animations, page flip, micro-interactions. |

### Backend

| Technology | Role |
|------------|------|
| **Node.js + Express** | HTTP API, CORS, JSON body parsing. |
| **Multer** | Multipart uploads (memory storage). |
| **dotenv** | Environment configuration. |

### AI / ML components

| Component | Technology |
|-----------|------------|
| **Embeddings** | Gemini (`gemini-embedding-001`), dimension from config (e.g. 768). |
| **Generation** | Gemini (`GEMINI_MODEL`, default e.g. `gemini-2.5-flash`). |
| **Vector DB** | Pinecone (`@pinecone-database/pinecone`). |

---

## 5. Core Components Explanation

### 5.1 RAG (retrieval)

1. **Indexing**: Each chunk is embedded; vectors are stored with `metadata: { text }`. IDs are `chunk-0`, `chunk-1`, … for the current document batch.
2. **Query**: The user question (or **enriched** query including the previous user message) is embedded with `embedOne`.
3. **Search**: `index.query({ vector, topK, includeMetadata: true })` (default `topK = 6` in code).
4. **Context assembly**: Match metadata texts are joined with a delimiter (`\n\n---\n\n`) and passed to the LLM as “document excerpts.”

**Note:** Each successful upload clears the namespace before upsert, aligning the index with **one active document** per deployment pattern in the current implementation.

### 5.2 Cache layer (CAG)

- **Store**: In-memory object keyed by **normalized** question (`lowercase`, trim, collapse whitespace) — `chatCache.service.js`.
- **Read**: Before Pinecone + LLM, if **no** session history exists.
- **Write**: After a fresh LLM answer, same condition.
- **Invalidate / clear**: `DELETE /cache` wipes all entries (used with “Start fresh”).

### 5.3 Streaming response handling

- **Protocol**: `GET` query `stream=1` (or `true`) on `POST /chat`, and/or `body.stream === true`.
- **Format**: `text/plain; charset=utf-8`, `Cache-Control: no-cache`, `X-Accel-Buffering: no`.
- **Behavior**: The server currently holds the **full** LLM string, then **chunks by words** with an optional delay (`delay` query param, capped) for UX—this is **simulated streaming**, not token-native streaming from Gemini.
- **Client**: `ReadableStream` reader accumulates bytes; optional `onChunk` updates UI.
- **Headers**: `X-Chat-Source` (`cache` | `llm`), `X-Chat-Session` (CORS `exposedHeaders` includes these).

### 5.4 Conversation memory logic

- **Storage**: `Map<sessionId, { turns: [{ user, assistant }], updatedAt }>` in `conversationMemory.service.js`.
- **Limits** (config / env):
  - `CHAT_MEMORY_MAX_TURNS` (default 10, clamped in config).
  - `CHAT_MEMORY_MAX_HISTORY_CHARS` (default 6000, clamped) — used when formatting history for the prompt.
- **Prompt trimming**: Oldest turns dropped first until the formatted history block fits the character budget.
- **Instructions**: Prompt text tells the model to use history mainly for follow-up resolution and to **ignore** when the new question is clearly unrelated to prior turns.

---

## 6. API Design

Base URL: backend origin (e.g. `http://127.0.0.1:3000`). In development, the Vite dev server proxies paths listed in `vite.config.js`.

### 6.1 Upload API

| Item | Value |
|------|--------|
| **Method / path** | `POST /upload` |
| **Content-Type** | `multipart/form-data` |
| **Field** | `file` (single file) |

**Success (200)** — example:

```json
{
  "success": true,
  "filename": "report.pdf",
  "characters": 45230,
  "chunks": 58
}
```

**Error (400/500)** — example:

```json
{ "error": "No file uploaded." }
```

### 6.2 Chat API

| Item | Value |
|------|--------|
| **Method / path** | `POST /chat` (alias: `POST /api/chat`) |
| **Content-Type** | `application/json` |

**Body (JSON)**

| Field | Type | Description |
|-------|------|-------------|
| `question` | string | **Required.** User query. |
| `sessionId` | string | Optional. Stable ID for multi-turn memory. |
| `stream` | boolean | Optional. If true (with `?stream=1`), response streams as `text/plain`. |

**Query parameters (streaming)**

| Param | Description |
|-------|-------------|
| `stream=1` or `true` | Enable streaming response. |
| `delay` | Inter-word delay in ms (server clamps, e.g. max 200). |

**Headers**

| Header | Description |
|--------|-------------|
| `X-Chat-Session` | Client may send session ID (alternative to body). |
| Response: `X-Chat-Session` | Always set to the active session. |
| Response: `X-Chat-Source` | `cache` or `llm`. |

**JSON response (200)**

```json
{
  "answer": "…",
  "source": "llm",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Streaming response (200)**

- Body: plain text (accumulated answer).
- Same headers as above; no JSON body.

**Session reset**

| Method / path | Description |
|---------------|-------------|
| `DELETE /chat/session?sessionId=<uuid>` | Clears server-side turns for that session. Body or `X-Chat-Session` also supported. |

### 6.3 Other endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check. |
| `DELETE` | `/cache` | Clears question→answer cache; returns `{ cleared: number }`. |

### 6.4 Response structure summary

| Endpoint | Success shape |
|----------|----------------|
| `/upload` | `{ success, filename, characters, chunks }` |
| `/chat` (JSON) | `{ answer, source, sessionId }` |
| `/chat` (stream) | Raw text stream + headers |
| `/cache` DELETE | `{ cleared }` |
| `/chat/session` DELETE | `{ ok: true }` |

---

## 7. Prompt Engineering

### 7.1 Construction

1. **System preamble** (`llm.service.js`): States that answers must be grounded in excerpts, avoid invention, and use prior conversation only to interpret short or ambiguous follow-ups.
2. **User content** from `promptBuilder.service.js` `buildRagUserPrompt`:
   - Optional **“Prior conversation”** section: numbered exchanges (`User:` / `Assistant:`), with explicit instructions to ignore when unrelated.
   - **“Document excerpts”**: retrieved RAG context.
   - **“Current question”**: the latest user message.
   - **“Answer”** cue for the model to complete.

### 7.2 History + context injection

- **History**: Only **previous** turns (not the current question) are loaded, formatted, then **trimmed** to a character budget so the prompt stays within practical limits.
- **Context**: Pinecone retrieval result is inserted as a single block between history (if any) and the current question.
- **Retrieval enhancement**: For follow-ups, the embedding input can combine the **last user message** and the **new question** to improve retrieval for coreference.

---

## 8. Folder Structure (Example)

```
pdfreader/
├── .env                          # Secrets (not committed): API keys, optional overrides
├── package.json                  # Optional monorepo / workspace root
├── TECHNICAL_DOCUMENTATION.md    # This file
├── backend/
│   ├── server.js                 # Entry: listen + port
│   ├── app.js                    # Express app, CORS, JSON, routes
│   ├── config/
│   │   └── index.js              # env → port, Gemini, Pinecone, CORS, chatMemory
│   ├── controllers/
│   │   ├── chat.controller.js
│   │   ├── upload.controller.js
│   │   ├── cache.controller.js
│   │   └── health.controller.js
│   ├── middleware/
│   │   └── upload.middleware.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── chat.routes.js
│   │   ├── upload.routes.js
│   │   └── system.routes.js
│   └── services/
│       ├── chat.service.js       # RAG + cache orchestration, streaming helper
│       ├── chatCache.service.js  # CAG store
│       ├── conversationMemory.service.js
│       ├── promptBuilder.service.js
│       ├── llm.service.js
│       ├── embedding.service.js
│       ├── vectorStore.service.js
│       ├── extraction.service.js
│       └── chunking.service.js
└── frontend/
    ├── vite.config.js            # Dev proxy to backend
    ├── package.json
    └── src/
        ├── main.jsx
        ├── App.jsx               # Upload ↔ Chat flip
        ├── api/
        │   ├── client.js
        │   ├── chatApi.js
        │   └── documentsApi.js
        ├── hooks/
        │   └── usePrefersReducedMotion.js
        ├── screens/
        │   ├── UploadScreen.jsx
        │   ├── UploadProgress.jsx
        │   └── ChatScreen.jsx
        └── components/
            ├── layout/           # AppCanvas, AmbientBackground, …
            ├── upload/           # Drop zone, progress, motion accents
            ├── chat/             # Reply bubble, shimmer, reveal text
            └── ui/
```

---

## 9. Scalability Considerations

### 9.1 Multiple users

- **Session memory**: Today keyed by client-provided `sessionId` (UUID). For production, bind sessions to **authenticated user IDs** and optionally **per-document conversation IDs** so tenants cannot collide.
- **Vector index**: Current model replaces namespace content on each upload—suitable for single-tenant or one-doc demos. Multi-user doc libraries need **namespaces or metadata filters** (e.g. `docId`, `userId`) and **no global deleteAll** on upload.

### 9.2 Moving memory to Redis or MongoDB

| Store | Pattern |
|-------|---------|
| **Redis** | `LPUSH` / `LRANGE` per `chat:{sessionId}` with `LTRIM`; TTL for auto-expiry; fast and simple. |
| **MongoDB** | Document per session with embedded `turns` array and `$slice` / capped array updates; better for analytics and backups. |

Keep the same **service interface** (`getPriorTurns`, `appendTurn`, `clearSession`) and swap the implementation.

### 9.3 Performance optimizations

- **Caching**: Keep CAG; consider Redis for multi-instance backends.
- **Embeddings**: Batch uploads already; for chat, single-query embedding is usually cheap vs. LLM.
- **Pinecone**: Tune `topK`, use namespaces, avoid unnecessary `deleteAll`.
- **Streaming**: Upgrade to **native** Gemini streaming to reduce time-to-first-token and memory spikes on long answers.
- **Token budgets**: Replace rough character caps with **tokenizer-based** limits for history + context.

---

## 10. Future Enhancements

| Direction | Idea |
|-----------|------|
| **AI agents** | Multi-step reasoning: plan → retrieve → verify → answer; optional critique pass. |
| **Tool calling** | Calculator, web search, or structured DB queries as tools with guardrails. |
| **Better memory** | Rolling **summarization** of old turns + keep last N turns verbatim; entity extraction for long-term memory. |
| **Multi-document RAG** | Per-upload `docId`, filter Pinecone queries, cite sources in the UI. |
| **OCR pipeline** | Support scanned PDFs via Tesseract or cloud OCR before chunking. |
| **Observability** | Structured logging, tracing (OpenTelemetry), latency metrics per stage (embed, retrieve, generate). |

---

## 11. Environment Variables (Reference)

| Variable | Purpose |
|----------|---------|
| `PORT` | Backend port (default `3000`). |
| `GEMINI_API_KEY` | Google AI API key. |
| `GEMINI_MODEL` | Chat model id. |
| `PINECONE_API_KEY` | Pinecone API key. |
| `PINECONE_INDEX` | Index name. |
| `CORS_ORIGIN` | CORS origin(s). |
| `CHAT_MEMORY_MAX_TURNS` | Max stored turns per session (clamped in config). |
| `CHAT_MEMORY_MAX_HISTORY_CHARS` | Max chars for formatted history in prompt (clamped). |

---

## Document meta

- **Audience**: Engineers, interviewers, and teammates onboarding to the codebase.
- **Accuracy**: Describes the implementation as of the repository structure and services listed above; adjust `topK`, chunk sizes, or streaming behavior in code if you change defaults.
