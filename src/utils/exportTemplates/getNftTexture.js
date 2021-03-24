import FontFaceObserver from 'fontfaceobserver';

function getNftTexture({ day, width: exportWidth, height: exportHeight }) {
    return new Promise((resolve) => {
        const font = new FontFaceObserver('Montserrat', {
            weight: 700,
        });

        font.load().then(() => {
            const multiplier = 2;
            const size = exportWidth * multiplier;
            const normalizedSize = 1080 * multiplier;
            const aspect = exportHeight / exportWidth;
            const width = size;
            const height = size * aspect;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: false });

            canvas.width = width;
            canvas.height = height;

            context.fillStyle = '#000';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.fillStyle = '#fff';
            context.fillRect(
                0,
                canvas.height - 500 * multiplier,
                canvas.width,
                canvas.height
            );

            context.font = `700 ${
                normalizedSize * 0.031434184675835
            }px "Montserrat"`;

            context.fillStyle = '#fff';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.fillText(
                'Daily',
                normalizedSize * 0.037037037037037,
                normalizedSize * 0.037037037037037
            );
            context.fillText(
                'CSS',
                normalizedSize * 0.037037037037037,
                normalizedSize * 0.037037037037037 * 1.88
            );
            context.fillText(
                'Design',
                normalizedSize * 0.037037037037037,
                normalizedSize * 0.037037037037037 * 2.7
            );

            context.textAlign = 'right';
            context.fillText(
                `Day ${day}`,
                canvas.width - normalizedSize * 0.037037037037037,
                normalizedSize * 0.037037037037037
            );

            const rectWidth = 0.035;

            context.fillRect(
                canvas.width -
                    normalizedSize * 0.037037037037037 -
                    normalizedSize * rectWidth -
                    normalizedSize * 0.001,
                normalizedSize * 0.037037037037037 * 2.2,
                normalizedSize * rectWidth,
                3
            );

            context.font = `700 ${
                normalizedSize * (17.5 / 1080)
            }px "Montserrat"`;
            context.fillText(
                `@DailyCssDesign`,
                canvas.width - normalizedSize * 0.037037037037037,
                normalizedSize * 0.037037037037037 * 2.68
            );

            const overlayTexture = new THREE.CanvasTexture(canvas);
            overlayTexture.generateMipmaps = false;
            overlayTexture.wrapS = overlayTexture.wrapT =
                THREE.ClampToEdgeWrapping;
            overlayTexture.minFilter = THREE.LinearFilter;

            resolve(overlayTexture);
        });
    });
}

export default getNftTexture;
