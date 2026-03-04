import { useEffect, useRef } from 'react';
import type { PanelMessage } from '../types/messages';

const WS_URL = 'ws://localhost:42069';
const RECONNECT_DELAY_MS = 3000;

// Connects to the Looky Loo daemon WebSocket.
// Returns a stable `send` function for sending messages to the daemon.
export function useDaemonSocket(
  onMessage: (msg: PanelMessage) => void
): (msg: object) => void {
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    function connect() {
      if (destroyed) return;

      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string) as PanelMessage;
          if (msg.type === 'render' || msg.type === 'clear') {
            onMessageRef.current(msg);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        if (!destroyed) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connect();

    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  const send = useRef((msg: object) => {
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg));
    }
  }).current;

  return send;
}
