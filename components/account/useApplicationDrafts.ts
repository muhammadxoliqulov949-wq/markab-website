'use client';

import { useCallback, useEffect, useState } from 'react';
import { readDrafts, removeDraft } from '@/lib/account/draft';
import type { FinancingApplication } from '@/lib/account/types';

/**
 * Reads locally-preserved application drafts.
 *
 * These are not applications. They exist because the financing form cannot
 * submit, and the dashboard uses them to show what an unsent draft will look
 * like — always labelled "Qoralama / yuborilmagan".
 */
export function useApplicationDrafts() {
  const [drafts, setDrafts] = useState<FinancingApplication[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setDrafts(readDrafts());
    setReady(true);
  }, []);

  const remove = useCallback((id: string) => {
    setDrafts(removeDraft(id));
  }, []);

  return { drafts, ready, remove };
}
