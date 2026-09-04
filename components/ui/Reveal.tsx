'use client';

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';

/**
 * Scroll-reveal primitives.
 *
 * PROGRESSIVE ENHANCEMENT, NOT A GATE.
 *
 * Content is ALWAYS visible by default: the server renders opacity: 1, so a
 * browser without JavaScript, a preview that never fires the observer, or a
 * page photographed before scrolling never shows an empty section. Motion only
 * enhances the entrance for elements that begin below the fold. A fallback
 * timer reveals anything the observer did not reach.
 */

type TagKind = 'div' | 'section' | 'li' | 'article' | 'ul' | 'ol';

export function Reveal({
  children,
  delay = 0,
  className = '',
  as: Tag = 'div',
  y = 14,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: TagKind;
  y?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced || typeof IntersectionObserver === 'undefined') return;

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    if (node.getBoundingClientRect().top < viewportHeight * 0.9) return;

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
    fallback = window.setTimeout(reveal, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  const style: CSSProperties = {
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
    transition: `opacity 620ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms, transform 620ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
  };

  return (
    <Tag ref={ref as never} data-reveal="" style={style} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Staggered reveal group.
 *
 * Applies sequenced delays to direct children with data-reveal-item via inline
 * styles when the parent enters viewport. All children visible by default.
 */
export function RevealGroup({
  children,
  className = '',
  as: Tag = 'div',
  step = 65,
  initialDelay = 0,
  y = 16,
  startIndex = 0,
}: {
  children: ReactNode;
  className?: string;
  as?: TagKind;
  step?: number;
  initialDelay?: number;
  y?: number;
  startIndex?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setActive(true);
      return;
    }

    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    if (node.getBoundingClientRect().top < viewportHeight * 0.9) {
      setActive(true);
      return;
    }

    let revealed = false;
    let fallback = 0;
    const reveal = () => {
      if (revealed) return;
      revealed = true;
      setActive(true);
      observer.disconnect();
      window.clearTimeout(fallback);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) reveal();
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' },
    );

    observer.observe(node);
    fallback = window.setTimeout(reveal, 2500);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  // Apply staggered delays to children via CSS nth-child
  const containerStyle: CSSProperties = {
    ['--rg-step' as string]: `${step}ms`,
    ['--rg-initial' as string]: `${initialDelay}ms`,
    ['--rg-y' as string]: `${y}px`,
  };

  return (
    <Tag
      ref={ref as never}
      data-reveal-group={active ? 'in' : 'pending'}
      className={`reveal-group ${className}`}
      style={containerStyle}
    >
      {children}
    </Tag>
  );
}

/**
 * RevealItem — an item inside a RevealGroup; its entrance is sequenced by order.
 */
export function RevealItem({
  children,
  className = '',
  as: Tag = 'div',
  index,
}: {
  children: ReactNode;
  className?: string;
  as?: TagKind;
  index?: number;
}) {
  const style: CSSProperties =
    index !== undefined
      ? ({
          ['--ri' as string]: index,
        } as CSSProperties)
      : {};
  return (
    <Tag
      data-reveal-item=""
      style={style}
      className={`reveal-item ${className}`}
    >
      {children}
    </Tag>
  );
}
