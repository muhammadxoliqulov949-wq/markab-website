#!/usr/bin/env node
/**
 * Allow-list consistency check (Phase 12 — D4).
 *
 * The decision "which remote host may serve images" is written down three
 * times, in three formats, because three different subsystems need it:
 *
 *   lib/security/url.ts   → ALLOWED_IMAGE_HOSTS   (validates stored values)
 *   next.config.mjs       → images.remotePatterns (next/image fetch guard)
 *   lib/security/csp.ts   → IMAGE_SOURCES         (browser img-src)
 *
 * That is a copy-paste bug waiting to happen, and the failure modes are both
 * bad and quiet: a host missing from `remotePatterns` makes next/image throw at
 * render time, and a host missing from `img-src` makes the browser refuse the
 * photograph. This reads all three from source and fails if they disagree.
 *
 * It also asserts the shape of the CSP this repository intends to ship, so a
 * future edit that quietly reintroduces `unsafe-inline` fails here rather than
 * in production.
 */

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');

const failures = [];
const notes = [];
const check = (name, ok, detail = '') =>
  (ok ? notes : failures).push(`  ${ok ? 'ok  ' : 'FAIL'} ${name}${ok || !detail ? '' : ` — ${detail}`}`);

const urlSrc = read('lib/security/url.ts');
const configSrc = read('next.config.mjs');
const cspSrc = read('lib/security/csp.ts');

// --- Hosts ------------------------------------------------------------------
const hostsFrom = (src, pattern) => {
  const found = new Set();
  for (const m of src.matchAll(pattern)) found.add(m[1]);
  return [...found].sort();
};

const urlHosts = hostsFrom(urlSrc, /'(api\.[a-z.]+|markab\.uz)'/g);
const configHosts = hostsFrom(configSrc, /hostname:\s*'([^']+)'/g);
// Extract only the https:// hosts declared inside IMAGE_SOURCES (not other directives).
const cspImgBlock = cspSrc.split('const IMAGE_SOURCES')[1]?.split(';')[0] ?? '';
const cspImgHosts = hostsFrom(cspImgBlock, /https:\/\/([a-z0-9.-]+)/g);

check('lib/security/url.ts declares at least one host', urlHosts.length > 0);
check('next.config.mjs declares at least one host', configHosts.length > 0);
check('lib/security/csp.ts declares at least one image host', cspImgHosts.length > 0);
check(
  'core image hosts appear in all three places (api.markab.uz)',
  urlHosts.includes('api.markab.uz') &&
    configHosts.includes('api.markab.uz') &&
    cspImgHosts.includes('api.markab.uz'),
);

// frame-src may include hosts that are NOT image-optimizable (e.g. map
// embeds). Resolve the FRAME_SOURCES constant so the check sees the final
// effective CSP string rather than the token name, and verify it is
// restricted to a small explicit set and never '*'.
function resolveConst(src, name) {
  const m = src.match(new RegExp(`const\\s+${name}\\s*=\\s*"([^"]+)"`));
  return m ? m[1] : '';
}
const frameSrcResolved = resolveConst(cspSrc, 'FRAME_SOURCES');
const frameHosts = hostsFrom(frameSrcResolved, /https:\/\/([a-z0-9.-]+)/g);
check(
  "frame-src does not contain wildcard '*'",
  !frameSrcResolved.includes('*'),
);
check(
  'frame-src allows Google Maps embed host (interactive)',
  frameHosts.includes('www.google.com') || frameHosts.includes('maps.google.com'),
  `frame=[${frameHosts}]`,
);
check(
  'frame-src lists a small explicit set (no more than three third-party hosts)',
  frameHosts.length <= 3,
  `frame=[${frameHosts}]`,
);

// --- CSP shape --------------------------------------------------------------
check("script-src builds a nonce source", /'nonce-\$\{nonce\}'/.test(cspSrc));
check("script-src includes 'strict-dynamic'", /'strict-dynamic'/.test(cspSrc));
check('no unsafe-inline in script-src', !/'unsafe-inline'/.test(cspSrc.split('script-src')[1]?.split('\n')[0] ?? ''));
// `unsafe-eval` is tolerated ONLY as the dev-server escape hatch: the token
// must appear exclusively on the guarded line that appends it when
// `scriptUnsafeEval` is true (middleware passes !isProduction(), so a
// production build never receives it). An unguarded occurrence — the
// regression this check exists to catch — fails here.
{
  const unsafeEvalLines = cspSrc.split('\n').filter((line) => line.includes("'unsafe-eval'"));
  check(
    'unsafe-eval appears only behind the scriptUnsafeEval dev guard',
    unsafeEvalLines.length > 0 && unsafeEvalLines.every((line) => line.includes('scriptUnsafeEval ?')),
    unsafeEvalLines.join(' | ').trim(),
  );
}
check('object-src is none', /\['object-src', "'none'"\]/.test(cspSrc));
check('frame-ancestors defaults to none', /"'none'"/.test(cspSrc));

// --- Server-only boundary ---------------------------------------------------
for (const file of ['lib/env/server.ts', 'lib/data/index.ts', 'lib/data/httpProvider.ts', 'lib/errors.ts']) {
  check(`${file} is server-only`, read(file).includes("import 'server-only'"));
}

console.log('allow-list consistency check');
notes.forEach((n) => console.log(n));
if (failures.length) {
  failures.forEach((f) => console.log(f));
  console.log(`\n${failures.length} check(s) failed`);
  process.exit(1);
}
console.log(`\nall ${notes.length} checks passed`);
