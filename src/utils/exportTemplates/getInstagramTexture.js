import FontFaceObserver from 'fontfaceobserver';

const DPI = 2; // render texture 2x

function getInstagramTexture({
    day,
    width: exportWidth,
    height: exportHeight,
    textScale,
}) {
    return new Promise((resolve) => {
        const font = new FontFaceObserver('Montserrat', {
            weight: 700,
        });

        font.load().then(() => {
            if (!textScale) {
                textScale = 1;
            }

            const size = exportWidth * DPI;
            const textMultiplier = 1080 * DPI * textScale;
            const aspect = exportHeight / exportWidth;
            const width = size;
            const height = size * aspect;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: false });

            canvas.width = width;
            canvas.height = height;

            context.fillStyle = '#000';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = `700 ${
                textMultiplier * 0.031434184675835
            }px "Montserrat"`;

            const sideMargin = textMultiplier * 0.037037037037037;

            context.fillStyle = '#fff';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.fillText('Daily', sideMargin, sideMargin);
            context.fillText('CSS', sideMargin, sideMargin * 1.88);
            context.fillText('Design', sideMargin, sideMargin * 2.7);

            context.textAlign = 'right';
            context.fillText(
                `Day ${day}`,
                canvas.width - sideMargin,
                sideMargin
            );

            const rectWidth = 0.035;

            context.fillRect(
                canvas.width -
                    sideMargin -
                    textMultiplier * rectWidth -
                    textMultiplier * 0.001,
                sideMargin * 2.2,
                textMultiplier * rectWidth,
                3
            );

            context.font = `700 ${
                textMultiplier * (17.5 / 1080)
            }px "Montserrat"`;
            context.fillText(
                `@DailyCssDesign`,
                canvas.width - sideMargin,
                sideMargin * 2.68
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

export default getInstagramTexture;
