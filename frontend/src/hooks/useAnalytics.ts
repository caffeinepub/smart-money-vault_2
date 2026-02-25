import { useCallback, useEffect, useState } from 'react';

export type LocalAnalyticsEvent = {
  id: string;
  timestamp: number;
  eventType: 'navigation' | 'tour' | 'stripe' | 'completed' | 'started';
  elementId: string;
  count: number;
  payload?: string;
};

const STORAGE_KEY = 'smart-money-vault-analytics';
const MAX_EVENTS = 100;

function getStoredEvents(): LocalAnalyticsEvent[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to parse stored analytics:', error);
  }
  return [];
}

function storeEvents(events: LocalAnalyticsEvent[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (error) {
    console.error('Failed to store analytics:', error);
  }
}

export function useAnalytics() {
  const [events, setEvents] = useState<LocalAnalyticsEvent[]>(getStoredEvents);

  useEffect(() => {
    storeEvents(events);
  }, [events]);

  const recordEvent = useCallback((
    eventType: LocalAnalyticsEvent['eventType'],
    elementId: string,
    payload?: string
  ) => {
    const newEvent: LocalAnalyticsEvent = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      eventType,
      elementId,
      count: 1,
      payload,
    };

    setEvents((prev) => {
      const updated = [newEvent, ...prev].slice(0, MAX_EVENTS);
      return updated;
    });
  }, []);

  const clearEvents = useCallback(() => {
    setEvents([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    events,
    recordEvent,
    clearEvents,
  };
}
