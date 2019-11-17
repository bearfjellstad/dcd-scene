/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Normal map shader
 * - compute normals from heightmap
 */

import { Vector2 } from 'three/src/math/Vector2';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    heightMap: { value: null },
    resolution: { value: new Vector2(512, 512) },
    scale: { value: new Vector2(1, 1) },
    height: { value: 0.05 },
  },
  vertexShader,
  fragmentShader,
};
