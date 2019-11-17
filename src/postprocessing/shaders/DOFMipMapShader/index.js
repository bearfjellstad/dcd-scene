/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader using mipmaps
 * - from Matt Handley @applmak
 * - requires power-of-2 sized render target with enabled mipmaps
 */

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tColor: { value: null },
    tDepth: { value: null },
    focus: { value: 1.0 },
    maxblur: { value: 1.0 },
  },
  vertexShader,
  fragmentShader,
};
