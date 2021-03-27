import vertexShader from './vertex.glsl';
import fragmentShader from './fragment.glsl';

export default {
    uniforms: {
        tDiffuse: { value: null },
        resolution: { value: new global.THREE.Vector2(1, 1) },
        vignetteBoost: { value: 0.22 },
        vignetteReduction: { value: 0.25 },
    },
    defines: {
        SHOW_MOUSE_TRACE: false,
        SHOW_NFT: false,
        SHOW_OVERLAY: false,
        IS_MOBILE: false,
    },
    vertexShader,
    fragmentShader,
};
