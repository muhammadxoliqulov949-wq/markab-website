'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Scroll-reveal wrapper.
 *
 * PROGRESSIVE ENHANCEMENT, NOT A GATE.
 *
 * Content is ALWAYS visible by default: the server renders `opacity: 1`, so a
 * browser without JavaScript, a preview that never fires the observer, or a
 * page photographed before scrolling never shows an empty section. Motion only
 * enhances the entrance for elements that begin below the fold, and it is never
 * allowed to leave something permanently invisible (a fallback timer reveals
 * anything the observer did not reach).
 */
export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'li' | 'article';
}) {
  const ref = useRef<HTMLElement | null>(null);
  // Visible on the server AND before any observer runs — the safe default.
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Motion is opt-out; no observer in this environment means no motion.
    if (prefersReduced || typeof IntersectionObserver === 'undefined') return;

    // Only animate elements that start below the fold. Anything already on
    // screen stays fully visible — there is nothing to reveal.
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    if (node.getBoundingClientRect().top < viewportHeight * 0.9) return;

    // Hide just in time and reveal when the visitor reaches it. This happens
    // after mount, so the server-rendered default (visible) is never the thing
    // a user sees flash away below the fold.
    setVisible(false);

    let revealed = false;
    let fallback = 0;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setVisible(true);
      observer.disconnect();
      window.clearTimeout(fallback);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal();
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(node);

    // Safety net: if the observer never fires (e.g. a framed preview or a
    // suppressed IO), content still becomes visible after a short delay.
    fallback = window.setTimeout(reveal, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const style = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 620ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 620ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
  };

  return (
    // data-reveal lets the <noscript> fallback in the root layout force the
    // content visible when JS never runs — motion must never hide content.
    <Tag ref={ref as never} data-reveal="" style={style} className={className}>
      {children}
    </Tag>
  );
}
