import logging from './logging.js';
import database from './database.js';
import queryEmotions from './queryEmotions.js';
/**
 *
 * @param {Express} app
 */
export function setupRoutes(app) {
    app.get('/history', async (req, res) => {
        let history = [];
        try {
            const token = req.body['token'];
            const queryResult = (await database.getHistoryByToken(token)) || [];

            // Upgrade id_emocao to id, name and color
            for (const result of queryResult) {
                // Validate result
                if (typeof result !== 'object') continue;
                if (!result.id_emotion) continue;

                // Upgrade id to more results
                result.emotion = queryEmotions.findById(result.id_emotion);
                delete result.id_emotion;

                history.push(result);
            }
            logging.log(history);
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
