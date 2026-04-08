/**
 * Fixed-size overlapping windows so sentences at chunk boundaries stay intact.
 */
function chunkText(text, size = 1000, overlap = 200) {
  const chunks = [];
  const step = size - overlap;
  for (let i = 0; i < text.length; i += step) {
    chunks.push(text.slice(i, i + size));
    if (i + size >= text.length) break;
  }
  return chunks;
}

module.exports = { chunkText };
