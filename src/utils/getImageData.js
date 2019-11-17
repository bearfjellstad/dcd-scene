function getPixelLuma(r, g, b) {
    return (r / 0xff) * 0.299 + (g / 0xff) * 0.587 + (b / 0xff) * 0.114;
}

function getImageData(image, width, height, elevation) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');

    context.drawImage(image, 0, 0);
    const imageData = context.getImageData(0, 0, width, height).data;
    const size = width * height;
    const data = new Float32Array(size * 3);

    for (let i = 0; i < size; i++) {
        const i3 = i * 3;
        const i4 = i * 4;
        const luma = getPixelLuma(
            imageData[i4],
            imageData[i4 + 1],
            imageData[i4 + 2]
        );
        data[i3] = (i % width) - width * 0.5;
        data[i3 + 1] = Math.floor((size - i) / width) - height * 0.5;
        data[i3 + 2] = luma * elevation;
    }

    return data;
}
