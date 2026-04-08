/**
 * Base URL for API calls. Empty string = same origin (Vite dev proxy).
 * Production: set VITE_API_URL=https://your-api.example.com
 */
const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '';

export function apiUrl(path) {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export async function parseJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { error: text || response.statusText };
  }
}
