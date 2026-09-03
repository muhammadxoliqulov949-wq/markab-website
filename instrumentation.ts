/**
 * Server start-up: record the security posture this process is running with.
 *
 * WHY THIS EXISTS
 *
 * The two deployment switches (`MARKAB_ALLOW_PREVIEW_FRAME`,
 * `MARKAB_IMAGE_UNOPTIMIZED`) both relax a production default, and both are set
 * only by the environment — so a production server started with a preview flag
 * looks, from the outside, exactly like a preview server. One structured line
 * at start-up turns "someone must remember to check" into something that shows
 * up in the log, where it can be alerted on.
 *
 * Deliberately logs *presence*, never values: whether the API token is set is
 * operationally useful, what it is must never reach a log.
 */
export async function register() {
  // Runs for both runtimes; the report belongs to the Node server only.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const previewFraming = process.env.MARKAB_ALLOW_PREVIEW_FRAME === 'true';
  const unoptimizedImages = process.env.MARKAB_IMAGE_UNOPTIMIZED === 'true';

  const posture = {
    ts: new Date().toISOString(),
    level: 'info',
    event: 'security.posture',
    nodeEnv: process.env.NODE_ENV ?? 'unknown',
    dataSource: process.env.MARKAB_DATA_SOURCE ?? 'mock',
    apiTokenConfigured: Boolean(process.env.MARKAB_API_TOKEN),
    csp: 'nonce + strict-dynamic',
    frameAncestors: previewFraming ? 'preview-origins' : 'none',
    hstsMaxAge: previewFraming ? 86400 : 63072000,
    imageOptimisation: unoptimizedImages ? 'disabled' : 'enabled',
    cspReporting: process.env.MARKAB_CSP_REPORT_ENDPOINT ? 'configured' : 'off',
  };

  if (previewFraming || unoptimizedImages) {
    posture.level = 'warn';
    posture.event = 'security.posture.relaxed';
  }

  // eslint-disable-next-line no-console
  console.log(JSON.stringify(posture));
}
