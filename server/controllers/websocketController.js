import { WebSocketServer } from 'ws'; 

let clients = [];

export const setupWebSocket = (server) => {
    const wss = new WebSocketServer({ server });

    wss.on('connection', (ws) => {
        clients.push(ws);
        
        ws.on('message', (message) => {
            // Broadcast message to all connected clients
            clients.forEach(client => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on('close', () => {
            clients = clients.filter(client => client !== ws);
        });
    });
};