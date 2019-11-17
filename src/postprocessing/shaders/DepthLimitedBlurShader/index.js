import { Vector2 } from 'three/src/math/Vector2';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  defines: {
    KERNEL_RADIUS: 4,
    DEPTH_PACKING: 1,
    PERSPECTIVE_CAMERA: 1,
  },
  uniforms: {
    tDiffuse: { type: 't', value: null },
    size: { type: 'v2', value: new Vector2(512, 512) },
    sampleUvOffsets: { type: 'v2v', value: [new Vector2(0, 0)] },
    sampleWeights: { type: '1fv', value: [1.0] },
    tDepth: { type: 't', value: null },
    cameraNear: { type: 'f', value: 10 },
    cameraFar: { type: 'f', value: 1000 },
    depthCutoff: { type: 'f', value: 10 },
  },
  vertexShader,
  fragmentShader,
};

export const BlurShaderUtils = {
  createSampleWeights: function(kernelRadius, stdDev) {
    const gaussian = function(x, stdDev) {
      return (
        Math.exp(-(x * x) / (2.0 * (stdDev * stdDev))) /
        (Math.sqrt(2.0 * Math.PI) * stdDev)
      );
    };

    const weights = [];

    for (let i = 0; i <= kernelRadius; i++) {
      weights.push(gaussian(i, stdDev));
    }

    return weights;
  },

  createSampleOffsets: function(kernelRadius, uvIncrement) {
    const offsets = [];

    for (let i = 0; i <= kernelRadius; i++) {
      offsets.push(uvIncrement.clone().multiplyScalar(i));
    }

    return offsets;
  },

  configure: function(material, kernelRadius, stdDev, uvIncrement) {
    material.defines['KERNEL_RADIUS'] = kernelRadius;
    material.uniforms[
      'sampleUvOffsets'
    ].value = BlurShaderUtils.createSampleOffsets(kernelRadius, uvIncrement);
    material.uniforms[
      'sampleWeights'
    ].value = BlurShaderUtils.createSampleWeights(kernelRadius, stdDev);
    material.needsUpdate = true;
  },
};
