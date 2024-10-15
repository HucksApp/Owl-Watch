import http from 'http'
import app from './app.js';
import {setupWebSocket} from './controllers/websocketController.js';
import allRoutes from './debug/debug.js';
import config from 'config'


// Create HTTP server and attach WebSocket
const server = http.createServer(app);
if (config.get('Stage') === 'development')
    allRoutes(app);
setupWebSocket(server);

// Start server
const PORT = config.get('serverPort')|| 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));