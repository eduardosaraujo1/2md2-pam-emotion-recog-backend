// Use dotenv on production
if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

function logError(message) {
    console.error(`[ERROR] ${message}`);
}

function log(message) {
    if (!process.env.HIDE_LOGS) {
        if (typeof message === 'string') {
            console.log(`[LOG] ${message}`);
        } else {
            console.log(message);
        }
    }
}

const logging = {
    logError,
    log,
};

export default logging;
