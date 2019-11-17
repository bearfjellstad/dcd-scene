import FontFaceObserver from 'fontfaceobserver';

function getLogoTexture(day = 367) {
    return new Promise(resolve => {
        const font = new FontFaceObserver('Montserrat', {
            weight: 700,
        });

        font.load().then(() => {
            const multiplier = 2;
            const size = 1080 * multiplier;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: false });

            canvas.width = size;
            canvas.height = size;

            context.fillStyle = '#000';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = `700 ${size * 0.031434184675835}px "Montserrat"`;

            context.fillStyle = '#fff';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.fillText(
                'Daily',
                size * 0.037037037037037,
                size * 0.037037037037037
            );
            context.fillText(
                'CSS',
                size * 0.037037037037037,
                size * 0.037037037037037 * 1.88
            );
            context.fillText(
                'Design',
                size * 0.037037037037037,
                size * 0.037037037037037 * 2.7
            );

            context.textAlign = 'right';
            context.fillText(
                `Day ${day}`,
                canvas.width - size * 0.037037037037037,
                size * 0.037037037037037
            );

            const rectWidth = 0.035;

            context.fillRect(
                canvas.width -
                    size * 0.037037037037037 -
                    size * rectWidth -
                    size * 0.001,
                size * 0.037037037037037 * 2.2,
                size * rectWidth,
                3
            );

            context.font = `700 ${size * (17.5 / 1080)}px "Montserrat"`;
            context.fillText(
                `@DailyCssDesign`,
                canvas.width - size * 0.037037037037037,
                size * 0.037037037037037 * 2.68
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

export default getLogoTexture;
