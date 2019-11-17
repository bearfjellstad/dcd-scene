/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Color correction
 */

import { Vector3 } from 'three/src/math/Vector3';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse: { value: null },
    powRGB: { value: new Vector3(2, 2, 2) },
    mulRGB: { value: new Vector3(1, 1, 1) },
    addRGB: { value: new Vector3(0, 0, 0) },
  },
  vertexShader,
  fragmentShader,
};
