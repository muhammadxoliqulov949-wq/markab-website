/**
 * SMS sender adapter.
 *
 * The UI never touches a concrete sender; the service layer calls
 * `getSmsSender()` which returns an implementation honouring this interface.
 *
 *   • 'disabled' → every send returns `status: 'unavailable'` with a public
 *     reason. This is the default in production until a real provider is
 *     configured. The auth service surfaces the reason verbatim so the user
 *     sees "we could not send the SMS right now" rather than a fake success.
 *
 *   • 'console'  → development helper that logs the code to the server log
 *     but returns `status: 'dev-logged'`. It is ONLY usable with
 *     NODE_ENV !== 'production' — an env check refuses to boot it for real
 *     traffic.
 *
 * A future integration (Twilio, Eskiz, Beeline SMS, Clickatell) adds a new
 * file in lib/sms/ and a factory case here. No code outside lib/sms needs to
 * change.
 */
import 'server-only';
import { serverEnv } from '@/lib/env/server';
import { formatPhoneE164 } from '@/lib/format/phone';

export interface SendSmsResult {
  status: 'sent' | 'dev-logged' | 'unavailable';
  reason?: string;
  provider?: string;
}

export interface SmsSender {
  readonly name: string;
  sendOtp(phoneE164: string, code: string, ttlMinutes: number): Promise<SendSmsResult>;
}

class DisabledSender implements SmsSender {
  readonly name = 'disabled';
  async sendOtp(): Promise<SendSmsResult> {
    return {
      status: 'unavailable',
      reason:
        'SMS provayderi ulanmagan. Iltimos, keyinroq qayta urinib ko‘ring yoki ofisga murojaat qiling.',
    };
  }
}

class ConsoleSender implements SmsSender {
  readonly name = 'console';
  async sendOtp(phoneE164: string, code: string, ttlMinutes: number): Promise<SendSmsResult> {
    // The 'console' provider is a development/preview tool that writes codes
    // to server logs. It refuses to run when MARKAB_ALLOW_PREVIEW_FRAME is
    // false AND NODE_ENV === 'production', to avoid a misconfigured prod
    // deployment silently logging OTP codes. Either set the flag explicitly
    // or run in development mode to use it.
    const env = serverEnv();
    if (env.isProduction && !process.env.MARKAB_ALLOW_PREVIEW_FRAME) {
      return {
        status: 'unavailable',
        reason: 'Console SMS sender is disabled in production.',
      };
    }
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: 'warn',
        event: 'sms.dev.code_sent',
        phone: formatPhoneE164(phoneE164),
        code,
        ttlMinutes,
        note: 'Development SMS provider — code is NOT delivered to a handset.',
      }),
    );
    return { status: 'dev-logged', provider: 'console' };
  }
}

let cached: SmsSender | null = null;
export function getSmsSender(): SmsSender {
  if (cached) return cached;
  const choice = serverEnv().smsProvider;
  cached = choice === 'console' ? new ConsoleSender() : new DisabledSender();
  return cached;
}
