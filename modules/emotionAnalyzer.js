import axios from 'axios';
import logging from './logging.js';
import queryEmotions from './queryEmotions.js';

// Use dotenv on production
if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

export function createEmotionAnalyzer(callback) {
    // Handle empty callback
    if (!callback) {
        throw new Error("EmotionAnalyzer: Callback mustn't be undefined");
    }

    // properties
    const API_URL = process.env.EMOTION_API_URL || 'http://localhost:5000/analyze';
    let currentImage = null;
    let processing = false;

    // request to process this image, it will be processed as soon as the API is available or
    function analyzeImage(image) {
        currentImage = image;
        processNextImage();
    }

    // processes the order if the processor is not already busy
    async function processNextImage() {
        // do not process if we are already processing something or there is nothing to process
        if (processing || !currentImage) return;

        // start process
        processing = true;

        // take image from 'stack'
        const img = currentImage;
        currentImage = null;

        // call process
        const result = await processImage(img);

        // processing is complete
        processing = false;

        // send result to callback
        callback(result);

        // process again if there is a new image
        if (currentImage) {
            processNextImage();
        }
    }

    // make api request
    async function processImage(img) {
        const RESPONSE_DELAY = process.env.EMOTION_API_RESPONSE_DELAY || 2000;
        try {
            // Adicionando delay ao tempo de resposta para poupar a API
            const response = await new Promise((resolve) => {
                setTimeout(async () => {
                    const res = await axios.post(API_URL, {
                        image: img,
                    });
                    resolve(res);
                }, RESPONSE_DELAY);
            });

            const data = response.data;
            const ret = {
                image: img,
                emotions: data,
            };

            return ret;
        } catch (e) {
            logging.logError(e.message);
            return {
                error: 'API_EXCEPTION',
            };
        }
    }

    return {
        analyze: analyzeImage,
    };
}

export function formatAnalysis(analysis) {
    if (!analysis) {
        logging.logError('formatAnlysisAndReturn: analysis was null');
        return;
    }
    // handle errors
    if (analysis?.error) {
        logging.logError(`formatAnlysisAndReturn: EmotionAPI encountered an error: ${analysis.error}`);
        return;
    }

    // assert analysis type
    if (typeof analysis !== 'object') {
        logging.logError(`formatAnalysisAndReturn received the non object ${analysis}`);
        return;
    }

    // assert required fields
    if (!analysis.image || !analysis.emotions) {
        logging.logError(`formatAnalysisAndReturn: missing fields from analysis object:`);
        logging.log(analysis);
        return;
    }

    // populate emotions with more data
    const emotions = analysis.emotions ?? [];
    const enhancedEmotions = [];
    for (const e of emotions) {
        // Skip if the emotion is missing or invalid
        if (!e?.emotion) continue;

        const matchingEmotion = queryEmotions.findByName(e.emotion);

        if (!matchingEmotion) {
            logging.log(`[WARNING] Skipping value because the emotion '${e.emotion}' was not found in emotions.json`);
            continue;
        }

        e.emotion = matchingEmotion;

        // Replace emotion name with the matching emotion object
        enhancedEmotions.push(e);
    }
    analysis.emotions = enhancedEmotions;

    return analysis;
}
