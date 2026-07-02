/** URL gốc BE (ảnh upload, static) */
export const API_ORIGIN = 'http://localhost:5000';

export function assetUrl(path?: unknown): string | null {
  if (path == null || path === '') return null;
  if (typeof path === 'object') return null;
  const normalized = typeof path === 'string' ? path.trim() : String(path).trim();
  if (!normalized || normalized === 'null' || normalized === 'undefined') return null;
  if (normalized.startsWith('http')) return normalized;
  return `${API_ORIGIN}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
}
