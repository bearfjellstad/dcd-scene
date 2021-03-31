import FontFaceObserver from 'fontfaceobserver';
const BOTTOM_HEIGHT = 252 * 1;

function getNftTexture({
    day = '',
    heading = '',
    descriptionLine1 = '',
    descriptionLine2 = '',
    width: exportWidth,
    height: exportHeight,
}) {
    return new Promise((resolve) => {
        if (!global.QRCode) {
            return console.warn('QR');
        }

        const fontNormal = new FontFaceObserver('Montserrat', {
            weight: 400,
        });
        const fontBold = new FontFaceObserver('Montserrat', {
            weight: 700,
        });

        Promise.all([fontNormal.load(), fontBold.load()]).then(() => {
            const multiplier = 2;
            const size = exportWidth * multiplier;
            const normalizedSize = exportWidth * multiplier * 1.2;
            const largeFontSize = normalizedSize * (34 / 1080);
            const smallFontSize = normalizedSize * (17 / 1080);
            const aspect = exportHeight / exportWidth;
            const width = size;
            const height = size * aspect;

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { alpha: false });

            canvas.width = width;
            canvas.height = height;

            context.fillStyle = '#000';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.font = `700 ${largeFontSize}px "Montserrat"`;

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

            context.font = `400 ${smallFontSize}px "Montserrat"`;
            context.fillText(
                `Designs made in code`,
                sideMargin,
                canvas.height - sideMargin * 1.35
            );

            context.font = `700 ${largeFontSize}px "Montserrat"`;
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

            const descriptionInitialOffset = 2.75;
            const descriptionLineHeight = 0.55;
            context.font = `700 ${smallFontSize}px "Montserrat"`;
            context.fillText(
                heading,
                canvas.width - sideMargin,
                sideMargin * (descriptionInitialOffset - 0.1) + // offset the heading a bit up
                    bottomY +
                    dayOffset
            );
            context.font = `400 ${smallFontSize}px "Montserrat"`;
            context.fillText(
                descriptionLine1,
                canvas.width - sideMargin,
                sideMargin *
                    (descriptionInitialOffset + descriptionLineHeight * 1) +
                    bottomY +
                    dayOffset
            );
            context.fillText(
                descriptionLine2,
                canvas.width - sideMargin,
                sideMargin *
                    (descriptionInitialOffset + descriptionLineHeight * 2) +
                    bottomY +
                    dayOffset
            );

            // QR code
            const qrElement = document.createElement('div');
            const qrSize = width * 0.15;
            const qr = new global.QRCode(qrElement, {
                text: `https://dailycssdesign.com/collect/${day}`,
                width: qrSize,
                height: qrSize,
                // colorDark: '#888',
                // colorLight: '#000',
                correctLevel: QRCode.CorrectLevel.L,
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
