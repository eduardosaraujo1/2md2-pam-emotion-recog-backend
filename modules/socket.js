import { WebSocketServer } from 'ws';
import logging from './logging.js';

export function createSocketServer({ server, onConnection, onMessage } = {}) {
    // Handle undefined
    if (!server) {
        throw new Error('Error: No server was specified');
    }

    if (!onConnection) {
        onConnection = function () {};
    }

    if (!onMessage) {
        onMessage = function () {};
    }

    // Connection object for all requests
    function createConnection(socket) {
        return {
            socket,
            state: {},
        };
    }

    // Setup server
    const wss = new WebSocketServer({ server });

    wss.on('connection', (socket, request) => {
        // Connection object
        const connection = createConnection(socket);

        // Log para exceções
        socket.on('error', logging.logError);

        // Connection event
        onConnection(connection, request);

        // Quando mensagem for recebida
        socket.on('message', (data) => {
            onMessage(connection, data);
        });
    });

    return wss;
}
