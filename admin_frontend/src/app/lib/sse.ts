import { ADMIN_API_URL } from './axios';

type TicketEventHandler = (type: string, payload: any) => void;

export function connectTicketStream(onEvent: TicketEventHandler) {
  let es: EventSource | null = null;
  let closed = false;
  let backoff = 1000;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const url = `${ADMIN_API_URL}/stream/admin/tickets${token ? `?token=${encodeURIComponent(token)}` : ''}`;

  const open = () => {
    if (closed) return;
    es = new EventSource(url);

    es.addEventListener('ticket_created', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent('ticket_created', data);
      } catch (_) {}
    });
    es.addEventListener('ticket_status', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent('ticket_status', data);
      } catch (_) {}
    });
    es.addEventListener('ticket_assigned', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent('ticket_assigned', data);
      } catch (_) {}
    });
    es.addEventListener('work_order_created', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        onEvent('work_order_created', data);
      } catch (_) {}
    });
    es.onerror = () => {
      if (closed) return;
      if (es) {
        es.close();
        es = null;
      }
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      timer = setTimeout(() => {
        backoff = Math.min(backoff * 2, 30000);
        open();
      }, backoff);
    };
    es.onopen = () => {
      backoff = 1000;
    };
  };

  open();

  const close = () => {
    closed = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    if (es) {
      es.close();
      es = null;
    }
  };

  return { close };
}
