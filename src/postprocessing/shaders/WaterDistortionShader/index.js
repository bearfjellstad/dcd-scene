/**
 * Simple and fast water distortion shader using noise for the X value
 * Based on https://www.shadertoy.com/view/lljBWy
 *
 * tDiffuse: base texture
 * iTime: global time
 * distortionSpeed: distortion speed/amount
 *
 * @author Marius Nohr
 */

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse: { type: 't', value: null },
    iTime: { type: 'f', value: 0.0 },
    distortionSpeed: { type: 'f', value: 0.005 },
  },
  vertexShader,
  fragmentShader,
};
