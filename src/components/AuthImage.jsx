/**
 * AuthImage — renders images served by the authenticated /v1/files/ endpoint.
 *
 * Normal <img src="..."> tags never send Authorization headers, so they would
 * receive a 401 from the protected endpoint. This component uses fetch() with
 * the bearer token, converts the response to a blob URL, then passes that to
 * an <img> element. Results are cached in memory so repeated renders of the
 * same URL only hit the network once per page load.
 */
import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';

// Module-level blob-URL cache: full URL string → object URL.
// Persists for the page lifetime — fine for a CRM with a bounded image set.
const _cache = new Map();

function fetchWithAuth(src) {
  const token = localStorage.getItem('access_token');
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  return fetch(src, { headers });
}

/**
 * Programmatically download a file that requires JWT auth.
 * Call this instead of <a href download> for /v1/files/ URLs.
 */
export async function downloadAuthFile(src, filename) {
  const res = await fetchWithAuth(src);
  if (!res.ok) throw new Error(`Download failed (HTTP ${res.status})`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * AuthImage component.
 *
 * Props:
 *   src        — full URL (already resolved, e.g. http://localhost:8000/v1/files/...)
 *   alt        — alt text
 *   className  — CSS classes forwarded to <img> or skeleton div
 *   style      — inline styles forwarded to <img> or skeleton div
 *   ...rest    — any other img props (loading, onClick, etc.)
 */
export default function AuthImage({ src, alt = '', className, style, ...rest }) {
  const [blobSrc, setBlobSrc] = useState(() => {
    // Warm start from cache — avoids flash on re-render
    if (!src) return null;
    if (src.startsWith('blob:') || src.startsWith('data:')) return src;
    return _cache.get(src) ?? null;
  });
  const [failed, setFailed] = useState(false);
  const latestSrc = useRef(src);

  useEffect(() => {
    latestSrc.current = src;

    if (!src) return;

    // Blob / data URIs need no auth — use directly
    if (src.startsWith('blob:') || src.startsWith('data:')) {
      setBlobSrc(src);
      setFailed(false);
      return;
    }

    // Already cached
    if (_cache.has(src)) {
      setBlobSrc(_cache.get(src));
      setFailed(false);
      return;
    }

    let cancelled = false;
    setBlobSrc(null);
    setFailed(false);

    fetchWithAuth(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        if (cancelled || latestSrc.current !== src) return;
        const url = URL.createObjectURL(blob);
        _cache.set(src, url);
        setBlobSrc(url);
      })
      .catch(() => {
        if (!cancelled && latestSrc.current === src) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [src]);

  if (!src) return null;

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 text-slate-300 ${className || ''}`}
        style={style}
        aria-label={alt}
      >
        <ImageOff className="h-6 w-6" />
      </div>
    );
  }

  if (!blobSrc) {
    return (
      <div
        className={`animate-pulse bg-slate-200 ${className || ''}`}
        style={style}
      />
    );
  }

  // eslint-disable-next-line jsx-a11y/alt-text
  return <img src={blobSrc} alt={alt} className={className} style={style} {...rest} />;
}
