const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function corsOrigin() {
  const raw = process.env.CORS_ORIGIN;
  if (raw === 'false') return false;
  if (!raw) {
    return process.env.NODE_ENV === 'production' ? false : true;
  }
  if (raw === 'true') return true;
  const list = raw.split(',').map((s) => s.trim()).filter(Boolean);
  if (list.length === 0) {
    return process.env.NODE_ENV === 'production' ? false : true;
  }
  if (list.length === 1) return list[0];
  return list;
}

const nodeEnv = process.env.NODE_ENV || 'development';

module.exports = {
  port: Number(process.env.PORT) || 3000,
  /** Bind address. Use 0.0.0.0 in containers / cloud so the port is reachable. */
  host: process.env.HOST || (nodeEnv === 'production' ? '0.0.0.0' : '127.0.0.1'),
  nodeEnv,
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    // Use a current model id (1.5-* names often 404 on v1beta). Override via GEMINI_MODEL in .env.
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    embedModel: 'gemini-embedding-001',
    embedDimensions: 768,
  },
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    indexName: process.env.PINECONE_INDEX || 'pdfreader',
    namespace: 'default',
  },
  cors: {
    origin: corsOrigin(),
  },
  chatMemory: {
    maxTurns: Math.min(50, Math.max(1, Number(process.env.CHAT_MEMORY_MAX_TURNS) || 10)),
    maxHistoryChars: Math.min(
      32000,
      Math.max(500, Number(process.env.CHAT_MEMORY_MAX_HISTORY_CHARS) || 6000),
    ),
  },
};
