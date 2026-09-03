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
const cspHosts = hostsFrom(cspSrc, /https:\/\/([a-z0-9.-]+)/g);

check('lib/security/url.ts declares at least one host', urlHosts.length > 0);
check('next.config.mjs declares at least one host', configHosts.length > 0);
check('lib/security/csp.ts declares at least one host', cspHosts.length > 0);
check(
  'the same host set appears in all three places',
  urlHosts.join() === configHosts.join() && configHosts.join() === cspHosts.join(),
  `url=[${urlHosts}] config=[${configHosts}] csp=[${cspHosts}]`,
);

// --- CSP shape --------------------------------------------------------------
check("script-src builds a nonce source", /'nonce-\$\{nonce\}'/.test(cspSrc));
check("script-src includes 'strict-dynamic'", /'strict-dynamic'/.test(cspSrc));
check('no unsafe-inline in script-src', !/'unsafe-inline'/.test(cspSrc.split('script-src')[1]?.split('\n')[0] ?? ''));
check('no unsafe-eval anywhere in the CSP', !/unsafe-eval/.test(cspSrc));
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
