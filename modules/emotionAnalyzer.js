import axios from 'axios';
import logging from './logging.js';
import queryEmotions from './queryEmotions.js';
import sharp from 'sharp';

// Use dotenv on production
if (process.env.NODE_ENV !== 'production') {
    const dotenv = await import('dotenv');
    dotenv.config();
}

export function createEmotionAnalyzer(callback) {
    if (!callback) throw new Error("EmotionAnalyzer: Callback mustn't be undefined");

    const API_URL = process.env.EMOTION_API_URL || 'http://localhost:5000/analyze';
    let currentImage = null;
    let processing = false;

    async function analyzeImage(image) {
        currentImage = image;
        processNextImage();
    }

    async function processNextImage() {
        if (processing || !currentImage) return;

        processing = true;

        const img = currentImage;
        currentImage = null;

        const result = await processImage(img);

        processing = false;

        callback(result);

        if (currentImage) {
            processNextImage();
        }
    }

    async function processImage(img) {
        try {
            const resizedImage = await resizeImage(img); // Optional optimization
            const response = await axios.post(API_URL, { image: resizedImage });
            return { image: resizedImage, emotions: response.data };
        } catch (e) {
            logging.logError(e.message);
            return { error: 'API_EXCEPTION' };
        }
    }

    function isBase64Image(base64Image) {
        const base64Regex = /^data:image\/(jpeg|png|webp);base64,/;
        return base64Regex.test(base64Image);
    }

    async function resizeImage(base64Image) {
        if (!isBase64Image(base64Image)) {
            throw new Error('Unsupported or invalid image format');
        }

        const base64Data = base64Image.split(',')[1]; // Remove metadata
        const buffer = Buffer.from(base64Data, 'base64');

        // Resize using sharp
        const resizedBuffer = await sharp(buffer)
            .resize(224, 224) // Adjust dimensions as needed
            .toBuffer();

        // Convert resized buffer back to base64
        return `data:image/jpeg;base64,${resizedBuffer.toString('base64')}`;
    }

    return { analyze: analyzeImage };
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
    if (!analysis.image || !analysis.emotions || !Array.isArray(analysis.emotions)) {
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
