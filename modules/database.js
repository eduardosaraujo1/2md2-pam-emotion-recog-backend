import mysql from 'mysql2';

import dotenv from 'dotenv';
dotenv.config();

const pool = mysql
    .createPool({
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT || '',
        database: process.env.MYSQL_DATABASE,
    })
    .promise();

async function getHistoryByToken(token) {
    const [result] = await pool.query(
        `
        SELECT e.id as 'id', e.nome 'name', e.hex_color 'color', h.dt_cadastro as 'datetime'
        FROM tb_historico as h
        JOIN tb_emocao as e 
        ON e.id = h.fk_id_emocao
        WHERE h.user_token = ?
        ORDER BY h.dt_cadastro DESC
        `,
        [token]
    );
    console.log(result);
    return result;
}

export const database = { getHistoryByToken };
