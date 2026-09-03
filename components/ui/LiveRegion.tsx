'use client';

import { useEffect, useState } from 'react';

/**
 * Global polite live region. Components call `announce(message)` to send a
 * screen-reader announcement (cart updated, form saved, etc.) without moving
 * focus. One <LiveRegion /> lives in the root layout; every call to announce()
 * updates it.
 *
 * Deliberately two parallel regions — polite for status updates, assertive
 * only for errors/confirmations that must interrupt.
 */
type Region = 'polite' | 'assertive';
type Subscriber = (message: string, region: Region) => void;

let listeners: Set<Subscriber> = new Set();
export function announce(message: string, region: Region = 'polite') {
  listeners.forEach((l) => l(message, region));
}

export function LiveRegion() {
  const [polite, setPolite] = useState('');
  const [assertive, setAssertive] = useState('');

  useEffect(() => {
    const sub: Subscriber = (message, region) => {
      if (region === 'assertive') {
        setAssertive('');
        // Clear + reset so repeated identical messages still re-announce.
        requestAnimationFrame(() => setAssertive(message));
      } else {
        setPolite('');
        requestAnimationFrame(() => setPolite(message));
      }
    };
    listeners.add(sub);
    return () => {
      listeners.delete(sub);
    };
  }, []);

  return (
    <>
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {polite}
      </div>
      <div aria-live="assertive" aria-atomic="true" className="sr-only" role="alert">
        {assertive}
      </div>
    </>
  );
}
