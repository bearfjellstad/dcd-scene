/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Focus shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse: { value: null },
    screenWidth: { value: 1024 },
    screenHeight: { value: 1024 },
    sampleDistance: { value: 0.94 },
    waveFactor: { value: 0.00125 },
  },
  vertexShader,
  fragmentShader,
};
