/**
 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
 *
 * Edge Detection Shader using Frei-Chen filter
 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
 *
 * aspect: vec2 of (1/width, 1/height)
 */

import { Vector2 } from 'three/src/math/Vector2';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse: { value: null },
    aspect: { value: new Vector2(512, 512) },
  },
  vertexShader,
  fragmentShader,
};
