import FontFaceObserver from 'fontfaceobserver';
const BOTTOM_HEIGHT = 252 * 1;

function getNftTexture({ day, width: exportWidth, height: exportHeight }) {
    return new Promise((resolve) => {
        if (!global.QRCode) {
            return console.warn('QR');
        }

        const font = new FontFaceObserver('Montserrat', {
            weight: 700,
        });

        font.load().then(() => {
            const multiplier = 2;
            const size = exportWidth * multiplier;
            const normalizedSize = exportWidth * multiplier * 1.2;
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
                normalizedSize * 0.031434184675835
            }px "Montserrat"`;

            const sideMargin = normalizedSize * 0.037037037037037;
            const bottomY = canvas.height - BOTTOM_HEIGHT * multiplier;
            const logoOffset = sideMargin * 0.25 * 0;
            const dayOffset = sideMargin * 0.5 * 0;

            // Fill bottom part
            context.fillStyle = '#fff';
            context.fillRect(0, bottomY, canvas.width, canvas.height);

            context.fillStyle = '#000';
            context.textAlign = 'left';
            context.textBaseline = 'top';
            context.fillText(
                'Daily',
                sideMargin,
                sideMargin + bottomY + logoOffset
            );
            context.fillText(
                'CSS',
                sideMargin,
                sideMargin * 1.88 + bottomY + logoOffset
            );
            context.fillText(
                'Design',
                sideMargin,
                sideMargin * 2.7 + bottomY + logoOffset
            );

            context.textAlign = 'right';
            context.fillText(
                `Day ${day}`,
                canvas.width - sideMargin,
                sideMargin + bottomY + dayOffset
            );

            const rectWidth = 0.035;
            context.fillRect(
                canvas.width -
                    sideMargin -
                    normalizedSize * rectWidth -
                    normalizedSize * 0.001,
                sideMargin * 2.2 + bottomY + dayOffset,
                normalizedSize * rectWidth,
                3
            );

            context.font = `700 ${
                normalizedSize * (17.5 / 1080)
            }px "Montserrat"`;
            context.fillText(
                `@DailyCssDesign`,
                canvas.width - sideMargin,
                sideMargin * 2.68 + bottomY + dayOffset
            );

            // QR code
            const qrElement = document.createElement('div');
            const qrSize = width * 0.15;
            const qr = new global.QRCode(qrElement, {
                text: `https://dailycssdesign.com/day/${day}?nft=1`,
                width: qrSize,
                height: qrSize,
                // colorDark: '#fff',
                // colorLight: '#000',
                // correctLevel : QRCode.CorrectLevel.H
            });

            setTimeout(() => {
                context.drawImage(
                    qr._oDrawing._elImage,
                    width / 2 - qrSize / 2,
                    bottomY + sideMargin,
                    qrSize,
                    qrSize
                );

                const overlayTexture = new THREE.CanvasTexture(canvas);
                overlayTexture.generateMipmaps = false;
                overlayTexture.wrapS = overlayTexture.wrapT =
                    THREE.ClampToEdgeWrapping;
                overlayTexture.minFilter = THREE.LinearFilter;

                resolve(overlayTexture);
            }, 150);
        });
    });
}

export default getNftTexture;
