/**
 * Structured, single-line logger.
 *
 * Every log line is JSON so a log aggregator (Datadog, Loki, CloudWatch) can
 * index `level` and `event` without extra parsing. The request logger below
 * adds a `traceId` and optional `userId` to every event emitted during a
 * request.
 *
 * Two levels matter for audit:
 *   • warn  — something we want to see but the request still succeeds (CSP
 *             violation, quarantined record, fallback used, missing opt-in
 *             integration).
 *   • error — something failed and the operator should know.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  traceId?: string;
  userId?: string | null;
  path?: string;
  method?: string;
  [key: string]: unknown;
}

function write(level: LogLevel, event: string, fields: Record<string, unknown> = {}) {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  else console.log(line);
}

export const log = {
  debug: (event: string, fields?: Record<string, unknown>) => write('debug', event, fields),
  info: (event: string, fields?: Record<string, unknown>) => write('info', event, fields),
  warn: (event: string, fields?: Record<string, unknown>) => write('warn', event, fields),
  error: (event: string, fields?: Record<string, unknown>) => write('error', event, fields),
};

/**
 * Bind a base context (traceId, userId, path, method) so we don't repeat them
 * at every call site inside handler code.
 */
export function bindLogger(base: LogContext) {
  return {
    debug: (event: string, fields: Record<string, unknown> = {}) =>
      write('debug', event, { ...base, ...fields }),
    info: (event: string, fields: Record<string, unknown> = {}) =>
      write('info', event, { ...base, ...fields }),
    warn: (event: string, fields: Record<string, unknown> = {}) =>
      write('warn', event, { ...base, ...fields }),
    error: (event: string, fields: Record<string, unknown> = {}) =>
      write('error', event, { ...base, ...fields }),
  };
}
