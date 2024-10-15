import { useEffect } from 'react';

const useWebSocket = (url, onMessage) => {
  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => console.log('WebSocket connected');
    ws.onmessage = (message) => onMessage(JSON.parse(message.data));
    ws.onclose = () => console.log('WebSocket disconnected');

    return () => ws.close();
  }, [url, onMessage]);
};

export default useWebSocket;
