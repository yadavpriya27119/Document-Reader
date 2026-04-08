const config = require('../config');
const chatCache = require('../services/chatCache.service');

function getHealth(_req, res) {
  const cache = chatCache.stats();
  const isProd = config.nodeEnv === 'production';
  res.json({
    ok: true,
    geminiModel: config.gemini.model,
    embedModel: config.gemini.embedModel,
    pineconeIndex: config.pinecone.indexName,
    cache: isProd ? { size: cache.size } : { size: cache.size, keys: cache.keys },
  });
}

module.exports = { getHealth };
