/**
 * @author bhouston / http://clara.io/
 *
 * Luminosity
 * http://en.wikipedia.org/wiki/Luminosity
 */

import THREE from '../../../utils/threeProxy';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default () => ({
    shaderID: 'luminosityHighPass',
    uniforms: {
        tDiffuse: { type: 't', value: null },
        luminosityThreshold: { type: 'f', value: 1.0 },
        smoothWidth: { type: 'f', value: 1.0 },
        defaultColor: { type: 'c', value: new THREE.Color(0x000000) },
        defaultOpacity: { type: 'f', value: 0.0 },
    },
    vertexShader,
    fragmentShader,
});
