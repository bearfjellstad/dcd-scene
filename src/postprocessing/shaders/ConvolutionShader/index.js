/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Convolution shader
 * ported from o3d sample to WebGL / GLSL
 * http://o3d.googlecode.com/svn/trunk/samples/convolution.html
 */

import { Vector2 } from 'three/src/math/Vector2';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

const { ceil, exp } = Math;

export default {
  defines: {
    KERNEL_SIZE_FLOAT: '25.0',
    KERNEL_SIZE_INT: '25',
  },
  uniforms: {
    tDiffuse: { value: null },
    uImageIncrement: { value: new Vector2(0.001953125, 0.0) },
    cKernel: { value: [] },
  },
  vertexShader,
  fragmentShader,
  buildKernel(sigma) {
    // We lop off the sqrt(2 * pi) * sigma term, since we're going to normalize anyway.

    function gauss(x, s) {
      return exp(-(x * x) / (2.0 * s * s));
    }

    let i = 0;
    let values = null;
    let sum = null;
    let halfWidth = null;
    const kMaxKernelSize = 25;
    let kernelSize = 2 * ceil(sigma * 3.0) + 1;

    if (kernelSize > kMaxKernelSize) kernelSize = kMaxKernelSize;
    halfWidth = (kernelSize - 1) * 0.5;

    values = new Array(kernelSize);
    sum = 0.0;

    for (i = 0; i < kernelSize; ++i) {
      values[i] = gauss(i - halfWidth, sigma);
      sum += values[i];
    }

    // normalize the kernel
    for (i = 0; i < kernelSize; ++i) values[i] /= sum;

    return values;
  },
};
