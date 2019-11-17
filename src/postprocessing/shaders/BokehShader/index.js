/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  uniforms: {
    tColor: { value: null },
    tDepth: { value: null },
    focus: { value: 1.0 },
    aspect: { value: 1.0 },
    aperture: { value: 0.025 },
    maxblur: { value: 1.0 },
  },
  vertexShader,
  fragmentShader,
};
