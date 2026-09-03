import 'server-only';

/**
 * Error reporting — one door for "something went wrong".
 *
 * THE LEAK BEING CLOSED
 *
 * Three pages used to render `result.error.message` straight into the HTML. A
 * message like
 *
 *   connect ECONNREFUSED 10.0.3.14:5432 — database "markab_prod" is down
 *
 * tells a stranger the internal address, the port, the database name and the
 * fact that it is refusing connections. None of that is the visitor's business,
 * and all of it is useful to someone choosing where to aim next. Stack traces
 * and driver errors are the same story in more detail.
 *
 * THE SPLIT
 *
 *   • `reportServerError()` — the operator's copy. Goes to the server log, with
 *     the real error attached, where the people who can act on it can read it.
 *   • `PUBLIC_ERROR_MESSAGE` — the visitor's copy. A fixed sentence in the
 *     product's language that says nothing about the internals. It never
 *     interpolates the error.
 *
 * A visitor-facing message that varies with the failure is a channel. Keeping
 * it constant closes the channel while still telling the truth: something went
 * wrong on our side, and we know about it.
 */

export const PUBLIC_ERROR_MESSAGE =
  'Ma’lumotlarni yuklashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring.';

/**
 * Log the real error server-side and return the fixed public sentence.
 *
 * `context` names the call site so the log is actionable without reproducing
 * the failure — the same discipline as an error digest, but local.
 */
export function reportServerError(context: string, error: unknown): string {
  const detail =
    error instanceof Error
      ? { message: error.message, stack: error.stack }
      : { message: String(error) };

  // Server log only. Never rendered, never serialised into the RSC payload.
  //
  // Structured, one line per event: a log aggregator can index `event` and
  // alert on the rate, which a human-readable sentence cannot. The stack is
  // included because this is the operator's copy and the operator needs it.
  console.error(
    JSON.stringify({
      ts: new Date().toISOString(),
      level: 'error',
      event: 'server.data-error',
      context,
      ...detail,
    }),
  );

  return PUBLIC_ERROR_MESSAGE;
}
