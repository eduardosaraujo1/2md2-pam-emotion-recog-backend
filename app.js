import express, { json } from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import axios from 'axios';

import crypto, { randomUUID } from 'crypto';
import { database } from './modules/database.js';
import { logging } from './modules/logging.js';

import dotenv from 'dotenv';
dotenv.config();

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

async function consumeEmotionAPI(url, image) {
    try {
        const response = await axios.post(url, {
            image,
        });
        return response.data;
    } catch (e) {
        logging.logError(e.message);
    }
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

    socket.on('message', async (data) => {
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

        // {"image": 'data:image/jpeg;base64,}
        if (obj['image']) {
            const image = obj['image'];
            const response = await consumeEmotionAPI(process.env.EMOTION_API_URL, image);
            console.log(response);
            socket.send(JSON.stringify(response));
        }
    });
});

server.listen(port, () => {
    console.log(`Server start on http://127.0.0.1:${port}`);
});
