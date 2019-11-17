/**
 * Depth-of-field post-process with bokeh shader
 */

import { Color } from 'three/src/math/Color';
import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import {
  NoBlending,
  LinearFilter,
  RGBFormat,
  RGBADepthPacking,
} from 'three/src/constants';
import { MeshDepthMaterial } from 'three/src/materials/MeshDepthMaterial';

import Pass from './Pass';
import FullScreenQuad from './FullScreenQuad';

import BokehShader from './shaders/BokehShader';

/**
 * Depth-of-field post-process with bokeh shader
 */

export default class BokehPass extends Pass {
  constructor(scene, camera, params = {}) {
    super();

    this.scene = scene;
    this.camera = camera;

    const focus = typeof params.focus !== 'undefined' ? params.focus : 1.0;
    const aspect =
      typeof params.aspect !== 'undefined' ? params.aspect : camera.aspect;
    const aperture =
      typeof params.aperture !== 'undefined' ? params.aperture : 0.025;
    const maxblur =
      typeof params.maxblur !== 'undefined' ? params.maxblur : 1.0;

    // render targets

    const width = params.width || global.innerWidth || 1;
    const height = params.height || global.innerHeight || 1;

    this.renderTargetColor = new WebGLRenderTarget(width, height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBFormat,
    });
    this.renderTargetColor.texture.name = 'BokehPass.color';

    this.renderTargetDepth = this.renderTargetColor.clone();
    this.renderTargetDepth.texture.name = 'BokehPass.depth';

    // depth material

    this.materialDepth = new MeshDepthMaterial();
    this.materialDepth.depthPacking = RGBADepthPacking;
    this.materialDepth.blending = NoBlending;

    // bokeh material

    const bokehShader = BokehShader;
    const bokehUniforms = UniformsUtils.clone(bokehShader.uniforms);

    console.log(bokehUniforms);

    bokehUniforms['tDepth'].value = this.renderTargetDepth.texture;

    bokehUniforms['focus'].value = focus;
    bokehUniforms['aspect'].value = aspect;
    bokehUniforms['aperture'].value = aperture;
    bokehUniforms['maxblur'].value = maxblur;
    // bokehUniforms['nearClip'].value = camera.near;
    // bokehUniforms['farClip'].value = camera.far;

    this.materialBokeh = new ShaderMaterial({
      defines: bokehShader.defines,
      uniforms: bokehUniforms,
      vertexShader: bokehShader.vertexShader,
      fragmentShader: bokehShader.fragmentShader,
    });

    this.uniforms = bokehUniforms;
    this.needsSwap = false;

    this.fsQuad = new FullScreenQuad(null);

    this.oldClearColor = new Color();
    this.oldClearAlpha = 1;
  }
  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    // Render depth into texture
    this.scene.overrideMaterial = this.materialDepth;

    this.oldClearColor.copy(renderer.getClearColor());
    this.oldClearAlpha = renderer.getClearAlpha();
    this.oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    renderer.setClearColor(0xffffff);
    renderer.setClearAlpha(1.0);
    renderer.setRenderTarget(this.renderTargetDepth);
    renderer.clear();
    renderer.render(this.scene, this.camera);

    // Render bokeh composite

    this.uniforms['tColor'].value = readBuffer.texture;
    this.uniforms['nearClip'].value = this.camera.near;
    this.uniforms['farClip'].value = this.camera.far;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      renderer.clear();
      this.fsQuad.render(renderer);
    }

    this.scene.overrideMaterial = null;
    renderer.setClearColor(this.oldClearColor);
    renderer.setClearAlpha(this.oldClearAlpha);
    renderer.autoClear = this.oldAutoClear;
  }
}
