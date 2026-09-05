'use client';

/**
 * Tiny API client for the browser.
 *
 * - Always sends `x-csrf-token` from the `markab_csrf` cookie.
 * - Always sends `content-type: application/json` + credentials: same-origin.
 * - Parses JSON responses; throws on non-2xx with a sanitised error shape.
 */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${name}=`;
  for (const part of document.cookie.split(';')) {
    const c = part.trim();
    if (c.startsWith(prefix)) return decodeURIComponent(c.slice(prefix.length));
  }
  return null;
}

async function getCsrfToken(): Promise<string> {
  const existing = readCookie('markab_csrf');
  if (existing && /^[0-9a-f]{64}$/.test(existing)) return existing;
  // Provision a token by hitting the GET of any state-changing endpoint.
  await fetch('/api/auth/request-code', { method: 'GET', credentials: 'same-origin' });
  return readCookie('markab_csrf') ?? '';
}

export class ApiError extends Error {
  code: string;
  fields?: Record<string, string>;
  status: number;
  constructor(status: number, code: string, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const csrf = await getCsrfToken();
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json');
  if (csrf && init.method && init.method !== 'GET') {
    headers.set('x-csrf-token', csrf);
  }
  const res = await fetch(path, {
    credentials: 'same-origin',
    ...init,
    headers,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = body?.error ?? {};
    throw new ApiError(res.status, err.code ?? 'request_failed', err.message ?? 'Xatolik yuz berdi.', err.fields);
  }
  return body as T;
}

export async function apiPost<T = unknown>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) });
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'DELETE' });
}
