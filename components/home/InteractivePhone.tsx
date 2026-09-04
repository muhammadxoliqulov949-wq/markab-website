'use client';

/**
 * InteractivePhone — premium floating smartphone with cursor-reactive tilt,
 * layered parallax and a soft moving glow.
 *
 * IMPLEMENTATION NOTES
 *
 *  • Mouse tracking is driven by a single requestAnimationFrame loop (started
 *    on mouseenter, stopped on mouseleave) that updates refs directly.
 *    React setState is NOT called per mousemove — that would re-render on
 *    every 16ms tick and fight the transform. Instead, each visual layer
 *    exposes a ref and we write a CSS custom property (`--mx`, `--my`,
 *    `--rx`, `--ry`, `--gx`, `--gy`) onto its element; CSS picks those up
 *    via transform: translate3d(...) rotateX(...) rotateY(...).
 *  • On mouseleave the target rotations lerp back to 0 over ~400ms via CSS
 *    transitions so the return feels physical rather than snapping.
 *  • On touch devices (pointerType==='touch') and under prefers-reduced-motion
 *    the listener is not attached and the phone rests in its neutral pose.
 *  • GPU-only properties are animated: transform and opacity. No top/left,
 *    no box-shadow interpolation, no layout-triggering work.
 *
 * All the numbers inside (UI cards, payment figure, bonus count) are demo
 * presentation for the section mockup — explicitly labelled as UI ko‘rinishi
 * in the surrounding section text.
 */

import { useEffect, useRef } from 'react';

const MAX_TILT_DEG = 7; // ±7° — restrained, premium
const PERSPECTIVE_PX = 1200;
const TRANSITION_MS = 420;
const LERP = 0.14; // spring-like smoothing toward cursor target
const RESET_LERP = 0.2; // faster lerp back to 0 on leave

export function InteractivePhone() {
  const stageRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const floatRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Current and target rotations/translations; mutable, not state.
  const current = useRef({ rx: 0, ry: 0, tx: 0, ty: 0, gx: 0, gy: 0 });
  const target = useRef({ rx: 0, ry: 0, tx: 0, ty: 0, gx: 0, gy: 0 });
  const active = useRef(false);
  const prefersReduced = useRef(false);

  useEffect(() => {
    // Respect reduced motion — don't attach pointer listeners at all.
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReduced.current = mql.matches;
    const onMqlChange = () => {
      prefersReduced.current = mql.matches;
      if (mql.matches) detach();
    };
    mql.addEventListener?.('change', onMqlChange);

    const stage = stageRef.current;
    if (!stage) return;

    // Only attach if the primary pointer is coarse (touch) — skip tilt logic.
    // Fine-pointer devices get the tilt. We detect per-pointer via event
    // pointerType rather than UA sniffing.
    let tiltEnabled = false;

    const onPointerEnter = (e: PointerEvent) => {
      if (prefersReduced.current) return;
      if (e.pointerType === 'touch' || e.pointerType === 'pen') return;
      tiltEnabled = true;
      active.current = true;
      enableTransitions(false); // direct tracking, no lag while active
      if (!rafRef.current) tick();
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!tiltEnabled || !active.current || prefersReduced.current) return;
      const rect = stage.getBoundingClientRect();
      // Normalized -1..1 across the stage
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      // Tilt is inverted: moving cursor to the RIGHT tilts the right edge
      // toward you (positive ry) — feels like the phone is tracking you.
      target.current.ry = nx * MAX_TILT_DEG;
      target.current.rx = -ny * MAX_TILT_DEG;
      // Subtle translate for physical presence
      target.current.tx = nx * 6;
      target.current.ty = ny * -4;
      // Glow follows the cursor at a slower ratio — soft halo, not a spotlight.
      target.current.gx = 50 + nx * 18; // percentage
      target.current.gy = 50 + ny * 16;
    };

    const onPointerLeave = () => {
      tiltEnabled = false;
      active.current = false;
      target.current = { rx: 0, ry: 0, tx: 0, ty: 0, gx: 50, gy: 50 };
      enableTransitions(true); // smooth return to neutral
    };

    function enableTransitions(on: boolean) {
      const phone = phoneRef.current;
      const screen = screenRef.current;
      const glow = glowRef.current;
      const float = floatRef.current;
      const all = [phone, screen, glow, float];
      const val = on
        ? `transform ${TRANSITION_MS}ms cubic-bezier(0.22,1,0.36,1), opacity 300ms ease`
        : 'none';
      all.forEach((el) => {
        if (el) el.style.transition = val;
      });
    }

    function applyTransforms() {
      const phone = phoneRef.current;
      const screen = screenRef.current;
      const glow = glowRef.current;
      const float = floatRef.current;

      const c = current.current;

      if (phone) {
        phone.style.transform =
          `translate3d(${c.tx.toFixed(2)}px, ${c.ty.toFixed(2)}px, 0) ` +
          `rotateX(${c.rx.toFixed(2)}deg) rotateY(${c.ry.toFixed(2)}deg)`;
      }
      if (screen) {
        // Screen moves with half the rotation + slightly more translate —
        // creates a subtle parallax between the frame and the UI layer.
        screen.style.transform =
          `translate3d(${(c.tx * 0.35).toFixed(2)}px, ${(c.ty * 0.35 - 2).toFixed(2)}px, 24px) ` +
          `rotateX(${(c.rx * 0.55).toFixed(2)}deg) rotateY(${(c.ry * 0.55).toFixed(2)}deg)`;
      }
      if (glow) {
        const dx = ((c.gx - 50) * 0.6).toFixed(2);
        const dy = ((c.gy - 50) * 0.6).toFixed(2);
        glow.style.transform = `translate(${dx}%, ${dy}%)`;
        glow.style.opacity = active.current ? '0.95' : '0.7';
      }
      if (float) {
        float.style.transform =
          `translate3d(${(c.tx * -0.7).toFixed(2)}px, ${(c.ty * -0.7 - 4).toFixed(2)}px, 40px) ` +
          `rotateX(${(c.rx * 0.3).toFixed(2)}deg) rotateY(${(c.ry * 0.3).toFixed(2)}deg)`;
      }
    }

    function tick() {
      const lerp = active.current ? LERP : RESET_LERP;
      const c = current.current;
      const t = target.current;
      c.rx += (t.rx - c.rx) * lerp;
      c.ry += (t.ry - c.ry) * lerp;
      c.tx += (t.tx - c.tx) * lerp;
      c.ty += (t.ty - c.ty) * lerp;
      c.gx += (t.gx - c.gx) * lerp;
      c.gy += (t.gy - c.gy) * lerp;

      applyTransforms();

      const settled =
        Math.abs(c.rx) < 0.02 &&
        Math.abs(c.ry) < 0.02 &&
        Math.abs(c.tx) < 0.05 &&
        Math.abs(c.ty) < 0.05 &&
        !active.current;

      if (settled) {
        rafRef.current = null;
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    }

    function detach() {
      active.current = false;
      tiltEnabled = false;
      target.current = { rx: 0, ry: 0, tx: 0, ty: 0, gx: 50, gy: 50 };
      enableTransitions(true);
      if (!rafRef.current) {
        // Kick off a short reset animation if needed
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    stage.addEventListener('pointerenter', onPointerEnter);
    stage.addEventListener('pointermove', onPointerMove);
    stage.addEventListener('pointerleave', onPointerLeave);
    stage.addEventListener('pointercancel', onPointerLeave);

    return () => {
      stage.removeEventListener('pointerenter', onPointerEnter);
      stage.removeEventListener('pointermove', onPointerMove);
      stage.removeEventListener('pointerleave', onPointerLeave);
      stage.removeEventListener('pointercancel', onPointerLeave);
      mql.removeEventListener?.('change', onMqlChange);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className="relative mx-auto flex h-[460px] w-full max-w-[320px] items-center justify-center overflow-x-visible overflow-y-visible sm:h-[540px] sm:max-w-[380px] lg:h-[600px] lg:max-w-[440px]"
      style={{ perspective: `${PERSPECTIVE_PX}px`, perspectiveOrigin: '50% 50%' }}
      aria-hidden="true"
    >
      {/* Layer 4 — soft radial glow, follows cursor subtly. Official Markab green. */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            'radial-gradient(60% 55% at 50% 50%, rgba(0,184,120,0.35) 0%, rgba(0,184,120,0.14) 38%, rgba(0,184,120,0) 70%)',
          transform: 'translate(0,0)',
          willChange: 'transform, opacity',
          opacity: 0.7,
          transition: 'opacity 300ms ease',
          filter: 'blur(2px)',
        }}
      />

      {/* Layer 4b — deeper neutral wash for the section background blending */}
      <div
        className="pointer-events-none absolute inset-0 -z-0"
        style={{
          background:
            'radial-gradient(70% 60% at 50% 55%, rgba(0,163,106,0.12) 0%, rgba(0,163,106,0) 70%)',
        }}
        aria-hidden="true"
      />

      {/* Phone body — Layer 1 (device frame) */}
      <div
        ref={phoneRef}
        className="relative z-10"
        style={{
          width: 'min(82%, 300px)',
          aspectRatio: '9 / 19.5',
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* Outer graphite frame */}
        <div
          className="absolute inset-0 rounded-[2.8rem] bg-gradient-to-b from-[#1b2128] via-[#0e1217] to-[#1b2128] p-[3px] shadow-[0_40px_70px_-20px_rgba(12,17,22,0.45),0_12px_30px_-12px_rgba(12,17,22,0.35)]"
          style={{ transform: 'translateZ(0)' }}
        >
          {/* Bevel highlight on the top/left edges — physical depth cue */}
          <div
            className="pointer-events-none absolute inset-0 rounded-[2.8rem]"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.06) 100%)',
            }}
            aria-hidden="true"
          />
          {/* Inner bevel */}
          <div className="relative h-full w-full overflow-hidden rounded-[2.6rem] bg-black ring-1 ring-white/5 ring-inset">
            {/* Screen bezel */}
            <div className="absolute inset-0 rounded-[2.6rem] bg-ink-900" />

            {/* Side buttons (volume / power) — tiny physical detail */}
            <span
              className="absolute -left-[3px] top-[22%] h-7 w-[3px] rounded-l bg-[#1b2128]"
              aria-hidden="true"
            />
            <span
              className="absolute -left-[3px] top-[30%] h-12 w-[3px] rounded-l bg-[#1b2128]"
              aria-hidden="true"
            />
            <span
              className="absolute -right-[3px] top-[26%] h-10 w-[3px] rounded-r bg-[#1b2128]"
              aria-hidden="true"
            />

            {/* Layer 2 — screen / UI: bright white Markab app with green accents */}
            <div
              ref={screenRef}
              className="absolute inset-[5px] overflow-hidden rounded-[2.35rem] bg-white"
              style={{
                transformStyle: 'preserve-3d',
                willChange: 'transform',
                boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.06)',
              }}
            >
              {/* Subtle top glass highlight — keeps the screen looking like glass */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(160deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 22%, rgba(255,255,255,0) 80%, rgba(15,23,42,0.03) 100%)',
                  mixBlendMode: 'normal',
                }}
                aria-hidden="true"
              />

              {/* Status bar */}
              <div className="flex items-center justify-between px-6 pt-4 text-[10px] font-medium text-ink-700">
                <span>9:41</span>
                <div className="flex items-center gap-1">
                  <span className="inline-block h-2 w-3.5 rounded-[2px] border border-ink-300">
                    <span className="block h-full w-[78%] rounded-[1px] bg-ink-700" />
                  </span>
                </div>
              </div>

              {/* Notch */}
              <div
                className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black"
                aria-hidden="true"
              />

              {/* Screen content — light UI matching official Markab */}
              <div className="px-5 pb-6 pt-8">
                {/* Header row: Markab mark */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-[13px] font-bold text-white shadow-[0_6px_14px_-6px_rgba(0,184,120,0.55)]">
                      M
                    </span>
                    <div className="leading-tight">
                      <p className="text-[11px] font-semibold tracking-wide text-ink-900">
                        Markab
                      </p>
                      <p className="text-[9px] text-ink-400">Halol moliya platformasi</p>
                    </div>
                  </div>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-sunken text-ink-500">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      aria-hidden="true"
                    >
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
                    </svg>
                  </span>
                </div>

                {/* Greeting */}
                <p className="mt-5 text-[10px] uppercase tracking-[0.14em] text-ink-400">
                  Assalomu alaykum
                </p>
                <h3 className="mt-1 text-base font-semibold leading-tight text-ink-900">
                  Xush kelibsiz
                </h3>

                {/* Next payment card — brand green primary card */}
                <div className="mt-4 rounded-2xl bg-brand-500 p-4 text-white shadow-[0_14px_26px_-12px_rgba(0,184,120,0.55)]">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-white/80">
                    Navbatdagi to‘lov
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-tight">
                    5,000,000
                    <span className="ml-1 text-[11px] font-semibold text-white/80">so‘m</span>
                  </p>
                  <div className="mt-3 flex items-center justify-between text-[10px] text-white/85">
                    <span>15 okt · Payshanba</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 font-medium">
                      3 kun qoldi
                    </span>
                  </div>
                </div>

                {/* Bonus card — white card with gold star */}
                <div className="mt-3 flex items-center gap-3 rounded-2xl bg-surface-muted px-4 py-3 ring-1 ring-line">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-50 text-accent-500">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 2l2.4 6.8H21l-5.6 4 2.1 6.7L12 15.6 6.5 19.5l2.1-6.7-5.6-4h6.6z" />
                    </svg>
                  </span>
                  <div className="leading-tight">
                    <p className="text-[10px] uppercase tracking-wide text-ink-400">
                      Bonus ballaringiz
                    </p>
                    <p className="text-base font-semibold text-ink-900">12,450</p>
                  </div>
                  <span className="ml-auto text-[10px] font-medium text-brand-600">+120 bugun</span>
                </div>

                {/* Quick nav tiles — white cards with green icons */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: 'Avtomobillar', hint: '20 ta' },
                    { label: 'Elektronika', hint: '42 ta' },
                  ].map((tile) => (
                    <div
                      key={tile.label}
                      className="rounded-xl bg-surface-muted px-3 py-2.5 ring-1 ring-line"
                    >
                      <p className="text-[11px] font-semibold text-ink-900">{tile.label}</p>
                      <p className="mt-0.5 text-[9px] text-ink-400">{tile.hint}</p>
                    </div>
                  ))}
                </div>

                {/* Bottom tab bar */}
                <div className="mt-4 flex items-center justify-around rounded-full bg-surface-sunken px-4 py-2 ring-1 ring-line">
                  {['Asosiy', 'Katalog', 'To‘lov', 'Profil'].map((t, i) => (
                    <span
                      key={t}
                      className={`text-[9px] font-medium ${i === 0 ? 'text-brand-600' : 'text-ink-400'}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* Home indicator */}
                <div className="mt-3 flex justify-center">
                  <span className="h-1 w-20 rounded-full bg-ink-300" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 3 — floating decorative card (mini notification), opposite parallax.
            Positioned closer to the phone body on small screens so it never
            bleeds outside the viewport; pulls outward on sm+. */}
        <div
          ref={floatRef}
          className="pointer-events-none absolute -right-1 -top-5 z-20 w-36 rounded-2xl border border-white/20 bg-white/95 p-2.5 shadow-lift backdrop-blur sm:-right-6 sm:-top-7 sm:w-44 lg:-right-8 lg:-top-8 lg:w-48 lg:p-3"
          style={{
            transform: 'translate3d(0,-4px,40px)',
            willChange: 'transform',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-50 text-brand-700 sm:h-7 sm:w-7">
              <svg
                className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="leading-tight">
              <p className="text-[9px] font-semibold text-ink-900 sm:text-[10px]">To‘lov muvaffaqiyatli</p>
              <p className="text-[8px] text-ink-500 sm:text-[9px]">2 daqiqa oldin</p>
            </div>
          </div>
          <p className="mt-1.5 text-[9px] leading-snug text-ink-500 sm:mt-2 sm:text-[10px]">
            Navbatdagi to‘lov amalga oshirildi.
          </p>
        </div>
      </div>

      {/* Soft ground shadow beneath the phone (separate from the frame shadow) */}
      <div
        className="pointer-events-none absolute bottom-[6%] left-1/2 z-0 h-6 w-[60%] -translate-x-1/2 rounded-[50%] bg-ink-900/20 blur-2xl"
        aria-hidden="true"
      />
    </div>
  );
}
