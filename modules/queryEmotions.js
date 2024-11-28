import emotionSource from '../static/emotions.json' with { type: 'json' };

function findById(id) {
    const emotion = emotionSource.emotions.find((e) => e.id === id);
    return emotion;
}

function findByName(name) {
    const emotion = emotionSource.emotions.find((e) => e.name === name);
    return emotion;
}

const queryEmotions = {
    findById,
    findByName,
};

export default queryEmotions;
