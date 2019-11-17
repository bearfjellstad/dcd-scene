/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Colorify shader
 */

import { Color } from 'three/src/math/Color';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse: { value: null },
    color: { value: new Color(0xffffff) },
  },
  vertexShader,
  fragmentShader,
};
