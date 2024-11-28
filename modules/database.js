import mysql from 'mysql2';
import logging from './logging.js';

if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

const pool = mysql
    .createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT || '3306',
        database: process.env.MYSQL_DATABASE,
    })
    .promise();

async function getHistoryByToken(token) {
    try {
        const query = `
    SELECT e.id as 'id', e.nome 'name', e.hex_color 'color', h.dt_cadastro as 'datetime'
    FROM tb_historico as h
    JOIN tb_emocao as e 
    ON e.id = h.fk_id_emocao
    WHERE h.user_token = ?
    ORDER BY h.dt_cadastro DESC
    `;
        const [result] = await pool.query(query, [token]);
        return result;
    } catch (e) {
        logging.logError(e.message);
    }
}

async function getEmotionByName(name) {
    try {
        const query = `
    SELECT id, nome 'name', hex_color 'color'
    FROM tb_emocao
    WHERE nome = ?
    `;
        const [result] = await pool.query(query, [name]);
        return result;
    } catch (e) {
        logging.logError(e.message);
    }
}

async function registerEmotionById(token, emotion) {
    try {
        const query = `
        INSERT INTO tb_historico (user_token, fk_id_emocao) VALUES
        (?, ?)
        `;
        const [result] = await pool.query(query, [token, emotion]);
        return result;
    } catch (e) {
        logging.logError(e.message);
    }
}

const database = {
    getHistoryByToken,
    getEmotionByName,
    registerEmotionById,
};

export default database;
