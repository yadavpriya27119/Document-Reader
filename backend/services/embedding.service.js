const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');

const BATCH = 5;
const DELAY_MS = 4000;

function getModel() {
  if (!config.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const genAI = new GoogleGenerativeAI(config.gemini.apiKey);
  return genAI.getGenerativeModel({ model: config.gemini.embedModel });
}

/**
 * Embed many texts (rate-limited for Gemini free tier).
 */
async function embedMany(texts) {
  const model = getModel();
  const dim = config.gemini.embedDimensions;
  const allVectors = [];

  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const results = await Promise.all(
      batch.map((text) =>
        model.embedContent({
          content: { parts: [{ text }] },
          outputDimensionality: dim,
        })
      )
    );
    allVectors.push(...results.map((r) => r.embedding.values));
    // eslint-disable-next-line no-console
    console.log(`  Embedded ${Math.min(i + BATCH, texts.length)} / ${texts.length} chunks`);

    if (i + BATCH < texts.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  return allVectors;
}

async function embedOne(text) {
  const model = getModel();
  const dim = config.gemini.embedDimensions;
  const result = await model.embedContent({
    content: { parts: [{ text }] },
    outputDimensionality: dim,
  });
  return result.embedding.values;
}

module.exports = { embedMany, embedOne };
