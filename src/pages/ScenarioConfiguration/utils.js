/**
 * Deep clone an object via JSON round-trip.
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Generate a short unique ID with optional prefix.
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Sanitize a string for use as an identifier (replace spaces with underscores, trim).
 */
export function sanitizeId(value) {
  return (value || '').trim().replace(/\s+/g, '_');
}

/**
 * Split a comma-separated string into a trimmed, non-empty array.
 */
export function splitComma(value) {
  return (value || '').split(',').map((s) => s.trim()).filter(Boolean);
}

/**
 * Join an array into a comma-separated string.
 */
export function joinComma(arr) {
  return Array.isArray(arr) ? arr.join(', ') : '';
}

/**
 * Safely parse JSON, returning null on failure.
 */
export function tryParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * Clean potential markdown wrappers from LLM JSON output.
 */
export function cleanJsonString(raw) {
  let s = (raw || '').trim();
  if (s.startsWith('```json')) s = s.slice(7);
  if (s.startsWith('```')) s = s.slice(3);
  if (s.endsWith('```')) s = s.slice(0, -3);
  return s.trim();
}
