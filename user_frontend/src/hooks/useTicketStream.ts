import { useState, useEffect, useRef, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export interface TicketEvent {
  type: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export function useTicketStream(ticketId: string | undefined) {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const retryCount = useRef(0);
  const esRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!ticketId) return;
    const token = localStorage.getItem("kiosk_token");
    if (!token) return;

    // EventSource doesn't support headers natively; use URL param as fallback
    const url = `${API_URL}/stream/tickets/${ticketId}?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onopen = () => {
      setConnected(true);
      retryCount.current = 0;
    };

    es.addEventListener("snapshot", (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents(Array.isArray(data) ? data : [data]);
      } catch {}
    });

    es.addEventListener("status", (e) => {
      try {
        const data = JSON.parse(e.data);
        setEvents((prev) => [...prev, { type: "status", data, timestamp: new Date().toISOString() }]);
      } catch {}
    });

    es.onerror = () => {
      setConnected(false);
      es.close();
      const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);
      retryCount.current++;
      setTimeout(connect, delay);
    };
  }, [ticketId]);

  useEffect(() => {
    connect();
    return () => {
      esRef.current?.close();
    };
  }, [connect]);

  return { events, connected };
}
