import express, { json } from 'express';
import crypto, { randomUUID } from 'crypto';
import { database } from './modules/database.js';
import { logging } from './modules/logging.js';

const app = express();
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
        logging.logError(e);
    } finally {
        res.send(history);
    }
});

app.get('/', (req, res) => {
    res.send('API is working successfully');
});

app.listen(port, () => {
    console.log(`Server start on http://127.0.0.1:${port}`);
});
