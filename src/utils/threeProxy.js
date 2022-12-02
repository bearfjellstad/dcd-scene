import extend from 'just-extend';
let localThree = {};
let originalRef;

export const setThree = (three) => {
    if (!three) {
        return;
    }

    originalRef = three;
    extend(localThree, three);
};

/**
 * In some cases you need to extend the real three.js. This will return the original reference
 * @returns THREE.js
 */
export const getOriginalRef = () => {
    return originalRef;
};

export default localThree;
