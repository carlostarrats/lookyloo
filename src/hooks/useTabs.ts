import { useState, useCallback } from 'react';
import type { LookyLooSchema, Platform } from '../schema/types';

export interface Tab {
  id: string;
  label: string;
  timestamp: string;
  platform: Platform;
  status: 'loading' | 'complete';
  schema: LookyLooSchema | null; // null only when status === 'loading'
}

export function useTabs() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  // Add a tab whose schema has already arrived — the common case.
  const addTab = useCallback((schema: LookyLooSchema): string => {
    const id = crypto.randomUUID();
    setTabs((prev) => [
      ...prev,
      {
        id,
        label: schema.label,
        timestamp: schema.timestamp,
        platform: schema.platform,
        status: 'complete',
        schema,
      },
    ]);
    setActiveTabId(id);
    return id;
  }, []);

  // Add a placeholder tab before its schema arrives (used by multi-screen flows).
  // The caller must call resolveTab() when the schema is ready.
  const addLoadingTab = useCallback((label: string, platform: Platform): string => {
    const id = crypto.randomUUID();
    setTabs((prev) => [
      ...prev,
      {
        id,
        label,
        timestamp: new Date().toISOString(),
        platform,
        status: 'loading',
        schema: null,
      },
    ]);
    setActiveTabId(id);
    return id;
  }, []);

  // Resolve a loading tab with its completed schema.
  const resolveTab = useCallback((id: string, schema: LookyLooSchema) => {
    setTabs((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              label: schema.label,
              timestamp: schema.timestamp,
              platform: schema.platform,
              status: 'complete' as const,
              schema,
            }
          : t
      )
    );
  }, []);

  const clearTabs = useCallback(() => {
    setTabs([]);
    setActiveTabId(null);
  }, []);

  const activeTab = tabs.find((t) => t.id === activeTabId) ?? null;

  return {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    addTab,
    addLoadingTab,
    resolveTab,
    clearTabs,
  };
}
