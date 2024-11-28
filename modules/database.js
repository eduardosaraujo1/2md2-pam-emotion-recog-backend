import mysql from 'mysql2/promise';
import logging from './logging.js';

if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

const pool = mysql.createPool(process.env.MYSQL_URL);

async function getHistoryByToken(token) {
    try {
        const query = `
    SELECT id_emocao as 'id_emotion', dt_cadastro as 'timestamp'
    FROM historico
    WHERE user_uuid = ?
    ORDER BY dt_cadastro DESC
    `;
        const [result] = await pool.query(query, [token]);
        return result;
    } catch (e) {
        logging.logError(e.message);
    }
}

async function registerEmotionById(token, emotion) {
    try {
        const query = `
        INSERT INTO historico (user_uuid, id_emocao) VALUES
        (?, ?)
        `;
        const [result] = await pool.query(query, [token, emotion]);
        return result;
    } catch (e) {
        logging.logError('Query/Database error: ' + e.message);
    }
}

const database = {
    getHistoryByToken,
    registerEmotionById,
};

export default database;
