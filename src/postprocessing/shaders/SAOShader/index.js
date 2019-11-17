import { Vector2 } from 'three/src/math/Vector2';
import { Matrix4 } from 'three/src/math/Matrix4';

import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
  defines: {
    NUM_SAMPLES: 7,
    NUM_RINGS: 4,
    NORMAL_TEXTURE: 0,
    DIFFUSE_TEXTURE: 0,
    DEPTH_PACKING: 1,
    PERSPECTIVE_CAMERA: 1,
  },
  uniforms: {
    tDepth: { type: 't', value: null },
    tDiffuse: { type: 't', value: null },
    tNormal: { type: 't', value: null },
    size: { type: 'v2', value: new Vector2(512, 512) },

    cameraNear: { type: 'f', value: 1 },
    cameraFar: { type: 'f', value: 100 },
    cameraProjectionMatrix: { type: 'm4', value: new Matrix4() },
    cameraInverseProjectionMatrix: { type: 'm4', value: new Matrix4() },

    scale: { type: 'f', value: 1.0 },
    intensity: { type: 'f', value: 0.1 },
    bias: { type: 'f', value: 0.5 },

    minResolution: { type: 'f', value: 0.0 },
    kernelRadius: { type: 'f', value: 100.0 },
    randomSeed: { type: 'f', value: 0.0 },
  },
  vertexShader,
  fragmentShader,
};
