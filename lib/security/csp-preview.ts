/**
 * Preview / CSP helper that does NOT import node-only modules.
 *
 * The middleware is bundled for the Edge runtime and cannot require
 * server-only code like lib/env/server (which pulls in `crypto`). This file
 * duplicates only the preview-framing / HSTS decision that middleware needs,
 * reading the env var directly from process.env (zod-validation happens on
 * the Node side when routes run).
 */

const BOOL_TRUE = new Set(['1', 'true', 'yes', 'on']);

export function allowPreviewFraming(): boolean {
  const raw = process.env.MARKAB_ALLOW_PREVIEW_FRAME ?? 'false';
  return BOOL_TRUE.has(raw.toLowerCase());
}

export function frameAncestorsPolicy(): string {
  return allowPreviewFraming()
    ? "'self' https://*.e2b.app https://*.arena.ai"
    : "'none'";
}

export function cspReportDirective(): [string, string] | null {
  const endpoint = (process.env.MARKAB_CSP_REPORT_ENDPOINT ?? '').trim();
  if (!endpoint) return null;
  return ['report-uri', endpoint];
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
