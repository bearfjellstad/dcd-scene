/**
 * @author alteredq / http://alteredqualia.com/
 */

import { WebGLRenderTarget } from 'three/src/renderers/WebGLRenderTarget';
import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { LinearFilter, RGBFormat } from 'three/src/constants';

import Pass from './Pass';
import FullScreenQuad from './FullScreenQuad';

import CopyShader from './shaders/CopyShader';

/**
 * @author alteredq / http://alteredqualia.com/
 */

export default class SavePass extends Pass {
  constructor(renderTarget) {
    super();

    const shader = CopyShader;

    this.textureID = 'tDiffuse';

    this.uniforms = UniformsUtils.clone(shader.uniforms);

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });

    this.renderTarget = renderTarget;

    if (this.renderTarget === undefined) {
      this.renderTarget = new WebGLRenderTarget(
        global.innerWidth,
        global.innerHeight,
        {
          minFilter: LinearFilter,
          magFilter: LinearFilter,
          format: RGBFormat,
          stencilBuffer: false,
        }
      );
      this.renderTarget.texture.name = 'SavePass.rt';
    }

    this.needsSwap = false;

    this.fsQuad = new FullScreenQuad(this.material);
  }

  render(renderer, writeBuffer, readBuffer) {
    if (this.uniforms[this.textureID]) {
      this.uniforms[this.textureID].value = readBuffer.texture;
    }

    renderer.setRenderTarget(this.renderTarget);
    if (this.clear) renderer.clear();
    this.fsQuad.render(renderer);
  }
}
