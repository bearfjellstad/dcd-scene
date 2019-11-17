/**
 * @author meatbags / xavierburrow.com, github/meatbags
 *
 * RGB Halftone pass for three.js effects composer.
 *
 */

import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import Pass from './Pass';
import FullScreenQuad from './FullScreenQuad';

import HalftoneShader from './shaders/HalftoneShader';

export default class MaskPass extends Pass {
  constructor(width, height, params) {
    super();

    this.uniforms = UniformsUtils.clone(HalftoneShader.uniforms);
    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      fragmentShader: HalftoneShader.fragmentShader,
      vertexShader: HalftoneShader.vertexShader,
    });

    // set params
    this.uniforms.width.value = width;
    this.uniforms.height.value = height;

    for (const key in params) {
      if (params.hasOwnProperty(key) && this.uniforms.hasOwnProperty(key)) {
        this.uniforms[key].value = params[key];
      }
    }

    this.fsQuad = new FullScreenQuad(this.material);
  }

  render(renderer, writeBuffer, readBuffer, deltaTime, maskActive) {
    this.material.uniforms['tDiffuse'].value = readBuffer.texture;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }

  setSize(width, height) {
    this.uniforms.width.value = width;
    this.uniforms.height.value = height;
  }
}
