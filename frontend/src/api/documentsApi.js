import { apiUrl, parseJsonResponse } from './client';

export async function uploadDocument(file) {
  const body = new FormData();
  body.append('file', file);

  const res = await fetch(apiUrl('/upload'), {
    method: 'POST',
    body,
  });

  const data = await parseJsonResponse(res);
  if (!res.ok) {
    throw new Error(data.error || res.statusText);
  }
  return data;
}

/**
 * Upload with progress (0–1). Network upload often finishes quickly; the server
 * may still be indexing — we ease the ball to ~92% then jump to 100% on response.
 */
export function uploadDocumentWithProgress(file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', apiUrl('/upload'));

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && e.total > 0) {
        const p = e.loaded / e.total;
        onProgress(Math.min(0.92, p * 0.92));
      }
    });

    xhr.addEventListener('load', () => {
      const data = parseJsonResponseSync(xhr.responseText);
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(1);
        resolve(data);
      } else {
        reject(new Error(data.error || xhr.statusText || 'Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error'));
    });

    const body = new FormData();
    body.append('file', file);
    xhr.send(body);
  });
}

function parseJsonResponseSync(text) {
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}
