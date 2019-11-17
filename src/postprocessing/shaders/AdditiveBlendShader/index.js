/**
 * Simple additive blend - sum the rgb values of 2 input textures
 *
 * tDiffuse: 	base texture
 * tAdd: 		texture to add
 * amount: 	amount to add 2nd texture
 *
 * @author felixturner / http://airtight.cc/
 */

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    tAdd: { type: 't', value: null },
    amount: { type: 'f', value: 1.0 },
  },
  vertexShader,
  fragmentShader,
};
