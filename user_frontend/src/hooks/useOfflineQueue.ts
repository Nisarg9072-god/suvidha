import { useState, useEffect, useCallback } from "react";

const QUEUE_KEY = "kiosk_offline_queue";

interface QueueItem {
  id: string;
  payload: unknown;
  createdAt: string;
}

export function useOfflineQueue() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<QueueItem[]>(() => {
    const stored = localStorage.getItem(QUEUE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const addToQueue = useCallback((payload: unknown) => {
    const item: QueueItem = { id: Date.now().toString(), payload, createdAt: new Date().toISOString() };
    setQueue((prev) => {
      const next = [...prev, item];
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
    localStorage.removeItem(QUEUE_KEY);
  }, []);

  return { isOnline, queue, addToQueue, clearQueue };
}
