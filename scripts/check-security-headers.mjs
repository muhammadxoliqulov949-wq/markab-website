#!/usr/bin/env node
/**
 * Security header regression check (Phase 12 — F2).
 *
 * Run against a RUNNING server:
 *
 *   node scripts/check-security-headers.mjs [baseUrl]
 *
 * Exits non-zero on the first failure, so it can gate a deploy. It asserts the
 * policy this repository intends to ship, and it is deliberately strict about
 * the two things that silently undo it: an inline-script allowance creeping
 * back into `script-src`, and a preview flag leaking into a production build.
 */

const base = (process.argv[2] || process.env.BASE || 'http://127.0.0.1:3000').replace(/\/$/, '');
const expectPreview = process.env.EXPECT_PREVIEW === 'true';

const failures = [];
const notes = [];

function check(name, condition, detail = '') {
  if (condition) {
    notes.push(`  ok   ${name}`);
  } else {
    failures.push(`  FAIL ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

async function headersFor(path) {
  const res = await fetch(base + path, { redirect: 'manual' });
  const out = {};
  res.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    // Two headers of the same name are both enforced; keep every value.
    out[k] = out[k] ? `${out[k]} | ${value}` : value;
  });
  return { status: res.status, headers: out };
}

const csp = (headers) => headers['content-security-policy'] || '';
const scriptSrc = (headers) => {
  const policy = csp(headers);
  const match = policy.split(';').map((d) => d.trim()).find((d) => d.startsWith('script-src'));
  return match || '';
};

(async () => {
  const home = await headersFor('/');
  const notFound = await headersFor('/definitely-not-a-route');

  // --- CSP -----------------------------------------------------------------
  check('CSP present', Boolean(csp(home.headers)));
  check('script-src uses a nonce', /'nonce-[A-Za-z0-9+/=_-]+'/.test(scriptSrc(home.headers)), scriptSrc(home.headers));
  check('script-src uses strict-dynamic', scriptSrc(home.headers).includes("'strict-dynamic'"));
  check('script-src does NOT allow unsafe-inline', !scriptSrc(home.headers).includes("'unsafe-inline'"));
  check('script-src does NOT allow unsafe-eval', !scriptSrc(home.headers).includes("'unsafe-eval'"));
  check('CSP has object-src none', /object-src 'none'/.test(csp(home.headers)));
  check('CSP has base-uri self', /base-uri 'self'/.test(csp(home.headers)));
  check('CSP has form-action self', /form-action 'self'/.test(csp(home.headers)));
  // frame-src is deliberately NOT 'none' because /contact embeds an
  // interactive map iframe (Google Maps via components/contact/OfficeMap.tsx).
  // The policy pins frame-src to an exact, explicit set — 'self' plus the
  // Google Maps embed hosts (www.google.com / maps.google.com) and
  // OpenStreetMap — no wildcard of any kind. This assertion is the live
  // regression gate for that allow-list: it must be updated IN THE SAME
  // commit as lib/security/csp.ts FRAME_SOURCES whenever a provider is added
  // or removed (the sibling static check, scripts/check-allowlists.mjs,
  // mirrors the constant). It never permits framing of our own pages (that
  // is controlled by frame-ancestors below).
  check(
    'frame-src restricted to self + Google Maps/OSM embed hosts only (no wildcards)',
    (() => {
      const directive = csp(home.headers)
        .split(';')
        .map((d) => d.trim())
        .find((d) => d.startsWith('frame-src'));
      if (!directive) return false;
      const sources = new Set(directive.split(/\s+/).slice(1));
      const allowed = new Set([
        "'self'",
        'https://www.google.com',
        'https://maps.google.com',
        'https://www.openstreetmap.org',
      ]);
      if (sources.size !== allowed.size) return false;
      for (const source of sources) {
        if (!allowed.has(source)) return false;
      }
      return true;
    })(),
    csp(home.headers),
  );

  if (expectPreview) {
    check('frame-ancestors allows the preview origins', /frame-ancestors 'self' https:\/\/\*\.e2b\.app https:\/\/\*\.arena\.ai/.test(csp(home.headers)));
    check('X-Frame-Options omitted in preview mode', !home.headers['x-frame-options']);
  } else {
    check('frame-ancestors is none', /frame-ancestors 'none'/.test(csp(home.headers)));
    check('X-Frame-Options is DENY', home.headers['x-frame-options'] === 'DENY', String(home.headers['x-frame-options']));
  }

  // A policy with no nonce means Next did not render the response — the page
  // would load with every script refused.
  check('CSP nonce differs between requests', await (async () => {
    const again = await headersFor('/');
    return csp(again.headers) !== csp(home.headers);
  })());

  // --- Other headers -------------------------------------------------------
  check('X-Content-Type-Options: nosniff', home.headers['x-content-type-options'] === 'nosniff');
  check('Referrer-Policy set', home.headers['referrer-policy'] === 'strict-origin-when-cross-origin');
  check('Permissions-Policy set', Boolean(home.headers['permissions-policy']));
  check('Cross-Origin-Opener-Policy: same-origin', home.headers['cross-origin-opener-policy'] === 'same-origin');
  check('Cross-Origin-Resource-Policy set', home.headers['cross-origin-resource-policy'] === 'same-origin');
  check('X-Permitted-Cross-Domain-Policies: none', home.headers['x-permitted-cross-domain-policies'] === 'none');
  check('Strict-Transport-Security present', Boolean(home.headers['strict-transport-security']));
  check('X-Powered-By absent', !home.headers['x-powered-by']);

  // --- Status codes --------------------------------------------------------
  check('unknown route returns 404', notFound.status === 404, `got ${notFound.status}`);
  check('404 responses carry the CSP too', Boolean(csp(notFound.headers)));

  // --- Report --------------------------------------------------------------
  console.log(`security header check — ${base}${expectPreview ? ' (preview mode)' : ' (production mode)'}`);
  notes.forEach((n) => console.log(n));
  if (failures.length) {
    failures.forEach((f) => console.log(f));
    console.log(`\n${failures.length} check(s) failed`);
    process.exit(1);
  }
  console.log(`\nall ${notes.length} checks passed`);
})();
