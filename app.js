import express, { json } from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import crypto, { randomUUID } from 'crypto';
import { database } from './modules/database.js';
import { logging } from './modules/logging.js';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const port = 3000;

// Read JSON from requests more easily
app.use(json());

app.get('/new-token', (req, res) => {
    res.send({ token: randomUUID() });
});

app.get('/history', async (req, res) => {
    let history = [];
    try {
        const token = req.body['token'];
        history = (await database.getHistoryByToken(token)) || [];
    } catch (e) {
        logging.logError(e.message);
    } finally {
        res.send(history);
    }
});

app.get('/', (req, res) => {
    res.send('API is working successfully');
});

// WebSocket for real time emotion detection and history
function validateToken(token) {
    return token != null && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token);
}

function parseQueryString(str) {
    const url = new URL(str, 'http://localhost');
    return Object.fromEntries(url.searchParams);
}

function parseWSMessage(message) {
    let response;
    try {
        response = JSON.parse(message);
    } catch {
        response = null;
    }
    return response;
}

wss.on('connection', (socket, request) => {
    // Error handling
    socket.on('error', logging.logError);

    // Validation
    const token = parseQueryString(request.url)['token'];

    if (!validateToken(token)) {
        socket.send(JSON.stringify({ error: "Missing 'token' for user validation" }));
        socket.close();
    }

    socket.on('message', (data) => {
        // Validate the message, ignore if invalid
        const obj = parseWSMessage(data.toString());
        console.log(obj);
        if (!obj) {
            return;
        }

        // {"register_emotion": n}
        if (obj['register']) {
            console.log('Assigning new emotion: ' + obj['register']);
            database.registerEmotion(token, obj['register']);
        }
    });
});

server.listen(port, () => {
    console.log(`Server start on http://127.0.0.1:${port}`);
});
