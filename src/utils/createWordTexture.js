import FontFaceObserver from 'fontfaceobserver';

const wordTextureStore = {};

function createWordTexture({ word, size, fontFamily, weight, shadowBlur }) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    const font = `${weight} ${size * 2}px '${fontFamily}'`;

    context.font = font;

    const wordWidth = Math.max(size * 1.4, context.measureText(word).width);

    canvas.width = wordWidth + 20;
    canvas.height = wordWidth + 20;

    context.fillStyle = '#000';
    context.fillRect(0, 0, wordWidth, wordWidth);

    context.fillStyle = '#fff';
    context.font = font;
    context.textAlign = 'center';
    context.textBaseline = 'middle';

    if (shadowBlur) {
        context.shadowBlur = shadowBlur;
        context.shadowColor = '#fff';
        context.fillText(word, canvas.width / 2, canvas.height / 2);
    } else {
        context.fillText(word, canvas.width / 2, canvas.height / 2);
    }

    const wordTexture = new THREE.CanvasTexture(canvas);
    wordTexture.generateMipmaps = false;
    wordTexture.wrapS = wordTexture.wrapT = THREE.ClampToEdgeWrapping;
    wordTexture.minFilter = THREE.LinearFilter;

    return wordTexture;
}

function getCachedTexture({
    word,
    size = 60,
    fontFamily = 'Montserrat',
    weight = 700,
    shadowBlur = 0,
} = {}) {
    return new Promise(resolve => {
        const cacheKey = `${word}-${size || ''}-${fontFamily}-${weight ||
            ''}-${shadowBlur || ''}`;

        if (wordTextureStore[cacheKey]) {
            resolve(wordTextureStore[cacheKey]);
        } else {
            const font = new FontFaceObserver(fontFamily, {
                weight,
            });

            font.load().then(
                () => {
                    const texture = createWordTexture({
                        word,
                        size,
                        fontFamily,
                        weight,
                        shadowBlur,
                    });
                    wordTextureStore[cacheKey] = texture;
                    resolve(wordTextureStore[cacheKey]);
                },
                () => {
                    console.log('font timed out');
                    const texture = createWordTexture({
                        word,
                        size,
                        fontFamily: 'sans-serif',
                        weight,
                        shadowBlur,
                    });
                    wordTextureStore[cacheKey] = texture;
                    resolve(wordTextureStore[cacheKey]);
                }
            );
        }
    });
}

export default getCachedTexture;
