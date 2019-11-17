/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Blend two textures
 */

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse1: { value: null },
    tDiffuse2: { value: null },
    mixRatio: { value: 0.5 },
    opacity: { value: 1.0 },
  },
  vertexShader,
  fragmentShader,
};
