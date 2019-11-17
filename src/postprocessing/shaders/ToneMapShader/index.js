/**
 * @author miibond
 *
 * Full-screen tone-mapping shader based on http://www.graphics.cornell.edu/~jaf/publications/sig02_paper.pdf
 */

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tDiffuse: { value: null },
    averageLuminance: { value: 1.0 },
    luminanceMap: { value: null },
    maxLuminance: { value: 16.0 },
    middleGrey: { value: 0.6 },
  },
  vertexShader,
  fragmentShader,
};
