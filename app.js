import express, { json } from 'express';
import http from 'http';

import { setupRoutes } from './modules/routes.js';
import { createSocketServer } from './modules/socket.js';

// Use dotenv on production
if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

const app = express();
const server = http.createServer(app);
const port = 3000;

// Setup socket server
createSocketServer({
    server: server,
});

// Read JSON from requests more easily
app.use(json());

// Setup REST routes
setupRoutes(app);

server.listen(port, () => {
    console.log(`Server start on http://127.0.0.1:${port}`);
});
