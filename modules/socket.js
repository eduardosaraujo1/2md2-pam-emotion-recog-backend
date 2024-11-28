import database from './database.js';
import queryEmotions from './queryEmotions.js';
import logging from './logging.js';
import { WebSocketServer } from 'ws';
import { createEmotionAnalyzer, formatAnalysis } from './emotionAnalyzer.js';

/**
 *
 * @param {object} connection
 * @param {WebSocket} connection.socket
 * @param {object} connection.state
 * @param {IncomingMessage} request
 */
function socketConnection(connection, request) {
    function validateUUID(uuid) {
        return uuid != null && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
    }

    function parseQueryString(str) {
        const url = new URL(str, 'http://localhost');
        return Object.fromEntries(url.searchParams);
    }

    function formatAnalysisAndReturn(analysis) {
        const formattedAnalysis = formatAnalysis(analysis);

        if (!formattedAnalysis) {
            return;
        }

        // send analysis to client
        connection.socket.send(JSON.stringify(formattedAnalysis));

        // logging: print only part of the 'image'
        const img = formattedAnalysis?.image;
        if (img && typeof img === 'string') {
            formattedAnalysis.image = img.slice(0, 150) + '...';
            logging.log(`{ image: '${formattedAnalysis.image}' }`);
        }
        logging.log(formattedAnalysis?.emotions);
    }

    // get user authentication
    const uuid = parseQueryString(request.url)?.['token'];

    if (!uuid || !validateUUID(uuid)) {
        connection.socket.send(
            JSON.stringify({
                error: 'NO_TOKEN_FOUND',
            })
        );
        connection.socket.close();
    }

    // create emotion analyzer
    const analyzer = createEmotionAnalyzer(formatAnalysisAndReturn);

    // Save uuid and analyzer to connection state
    connection.state.auth = uuid;
    connection.state.analyzer = analyzer;
}

/**
 *
 * @param {object} connection
 * @param {WebSocket} connection.socket
 * @param {object} connection.state
 * @param {string} data
 */
function socketMessage(connection, data) {
    function isNumeric(str) {
        return (
            !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str))
        ); // ...and ensure strings of whitespace fail
    }

    function extractRequest(str) {
        let req;
        try {
            req = JSON.parse(str);
        } catch {
            req = {
                error: 'INVALID_REQUEST_FORMAT',
            };
        }
        return req;
    }

    function registerEmotion(emotionId, token) {
        // Validate emotion ID
        if (!isNumeric(emotionId) || !queryEmotions.findById(+emotionId)) {
            console.log(emotionId);
            console.log(isNumeric(emotionId));
            console.log(queryEmotions.findById(+emotionId));
            logging.log(`Client did not specify a valid emotion. Failing silently`);
            return;
        }

        // Register to database
        database.registerEmotionById(token, +emotionId);
    }

    function getStateValues() {
        const { auth: token, analyzer: emotionAnalyzer } = connection.state;
        if (!token) {
            logging.logError('No token was found: closing connection');
            connection.socket.send("Please specify the 'token' query string param before connecting");
            connection.socket.close();
        }

        if (!emotionAnalyzer) {
            throw new Error('WebSocket onMessage: Missing emotion analyzer');
        }
        return { token, emotionAnalyzer };
    }

    logging.log('Received message from client, processing');

    const { token, emotionAnalyzer } = getStateValues();

    // Get request data
    const req = extractRequest(data.toString());

    // Validate request
    if (req.error) {
        logging.logError(req.error);
        return;
    }

    // Register emotion to history
    if (req.register) {
        logging.log(`Client requested to register emotion ${req.register}`);
        registerEmotion(req.register, token);
    }

    // Process image
    if (req.image) {
        logging.log(`Client requested frame analysis`);

        // check if requester sent base64 valid image
        const img = req.image;
        if (typeof img !== 'string') {
            logging.logError(`ImageAnalyzer: Image is invalid: ${typeof req.image}`);
            return; // fail silently
        }

        logging.log('Image: ' + img.slice(0, 300) + '...');

        // Add image to analyzer queue
        emotionAnalyzer.analyze(req.image);
    }
}

export function createSocketServer({ server, onConnection, onMessage } = {}) {
    // Handle undefined
    if (!server) {
        throw new Error('Error: No server was specified');
    }

    if (!onConnection) {
        onConnection = socketConnection;
    }

    if (!onMessage) {
        onMessage = socketMessage;
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
