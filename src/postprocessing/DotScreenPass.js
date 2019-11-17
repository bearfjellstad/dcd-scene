/**
 * @author alteredq / http://alteredqualia.com/
 */

import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';

import Pass from './Pass';
import FullScreenQuad from './FullScreenQuad';

import DotScreenShader from './shaders/DotScreenShader';

export default class DotScreenPass extends Pass {
  constructor(center, angle, scale) {
    super();

    const shader = DotScreenShader;

    this.uniforms = UniformsUtils.clone(shader.uniforms);

    if (center !== undefined) this.uniforms['center'].value.copy(center);
    if (angle !== undefined) this.uniforms['angle'].value = angle;
    if (scale !== undefined) this.uniforms['scale'].value = scale;

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });

    this.fsQuad = new FullScreenQuad(this.material);
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    this.uniforms['tDiffuse'].value = readBuffer.texture;
    this.uniforms['tSize'].value.set(readBuffer.width, readBuffer.height);

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }
}
