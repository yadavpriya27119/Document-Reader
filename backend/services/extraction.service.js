const path = require('path');
const pdfParse = require('pdf-parse');
const JSZip = require('jszip');

/**
 * Extract plain text from an uploaded file buffer (PDF, DOCX, TXT).
 */
async function extractText(file) {
  const ext = path.extname(file.originalname).toLowerCase();

  if (ext === '.txt') {
    return file.buffer.toString('utf8');
  }

  if (ext === '.pdf') {
    const result = await pdfParse(file.buffer);
    return result.text || '';
  }

  if (ext === '.docx') {
    const zip = await JSZip.loadAsync(file.buffer);
    const docFile = zip.file('word/document.xml');
    if (!docFile) throw new Error('Invalid DOCX file');
    const xml = await docFile.async('string');
    return xml
      .replace(/<[^>]+>/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/\s+/g, ' ')
      .trim();
  }

  throw new Error('Unsupported file type. Use .pdf, .txt, or .docx');
}

module.exports = { extractText };
