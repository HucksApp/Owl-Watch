import http from 'http'
import app from './app.js';
import allRoutes from './debug/debug.js';
import config from 'config'



const server = http.createServer(app);
if (config.get('Stage') === 'development')
    allRoutes(app);

// Start server
const PORT = config.get('serverPort')|| 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));