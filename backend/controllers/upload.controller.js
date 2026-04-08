const { extractText } = require('../services/extraction.service');
const { chunkText } = require('../services/chunking.service');
const { upsertChunks } = require('../services/vectorStore.service');

const MIN_TEXT_CHARS = 50;

async function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const text = await extractText(req.file);

    if (text.trim().length < MIN_TEXT_CHARS) {
      return res.status(400).json({
        error:
          `Could not extract text from "${req.file.originalname}". ` +
          `Only ${text.trim().length} characters found. ` +
          `This file is likely a scanned/image-based PDF. ` +
          `Please use a text-based PDF, DOCX, or TXT file.`,
      });
    }

    const chunks = chunkText(text).filter((c) => c.trim().length > 0);
    // eslint-disable-next-line no-console
    console.log(`[upload] ${req.file.originalname} — ${text.length} chars, ${chunks.length} chunks`);

    await upsertChunks(chunks);

    return res.json({
      success: true,
      filename: req.file.originalname,
      characters: text.length,
      chunks: chunks.length,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { uploadDocument };
