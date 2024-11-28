import logging from './logging.js';
import database from './database.js';
/**
 *
 * @param {Express} app
 */
export function setupRoutes(app) {
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
}
