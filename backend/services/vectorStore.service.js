const { Pinecone } = require('@pinecone-database/pinecone');
const config = require('../config');
const { embedMany, embedOne } = require('./embedding.service');

function getIndex() {
  if (!config.pinecone.apiKey) {
    throw new Error('PINECONE_API_KEY is not configured');
  }
  return new Pinecone({ apiKey: config.pinecone.apiKey })
    .index(config.pinecone.indexName)
    .namespace(config.pinecone.namespace);
}

async function upsertChunks(chunks) {
  if (!chunks.length) {
    throw new Error('No chunks to index — document text is empty.');
  }

  const index = getIndex();
  const vectors = await embedMany(chunks);

  if (vectors.length !== chunks.length) {
    throw new Error(`Embedding mismatch: got ${vectors.length} vectors for ${chunks.length} chunks.`);
  }

  const records = chunks
    .map((text, i) => ({
      id: `chunk-${i}`,
      values: vectors[i],
      metadata: { text },
    }))
    .filter((r) => Array.isArray(r.values) && r.values.length > 0);

  // eslint-disable-next-line no-console
  console.log(`  Valid records to upsert: ${records.length} / ${chunks.length}`);
  // eslint-disable-next-line no-console
  console.log(`  Vector dimension: ${records[0]?.values?.length}`);

  if (!records.length) {
    throw new Error('All embedding vectors came back empty — cannot upsert.');
  }

  try {
    await index.deleteAll();
  } catch (_) {
    /* namespace may not exist on first run */
  }

  for (let i = 0; i < records.length; i += 100) {
    await index.upsert({ records: records.slice(i, i + 100) });
    // eslint-disable-next-line no-console
    console.log(`  Upserted ${Math.min(i + 100, records.length)} / ${records.length} to Pinecone`);
  }

  // eslint-disable-next-line no-console
  console.log(`Stored ${records.length} chunks in Pinecone.`);
}

async function querySimilarText(question, topK = 6) {
  const queryVector = await embedOne(question);
  const result = await getIndex().query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });
  const matches = result.matches || [];
  return matches.map((m) => m.metadata.text).join('\n\n---\n\n');
}

module.exports = { upsertChunks, querySimilarText };
