/**
 * @author alteredq / http://alteredqualia.com/
 */

import { _Math as tMath } from 'three/src/math/Math';
import { UniformsUtils } from 'three/src/renderers/shaders/UniformsUtils';
import { ShaderMaterial } from 'three/src/materials/ShaderMaterial';
import { DataTexture } from 'three/src/textures/DataTexture';
import { FloatType, RGBFormat } from 'three/src/constants';

import Pass from './Pass';
import FullScreenQuad from './FullScreenQuad';

import DigitalGlitch from './shaders/DigitalGlitch';

export default class GlitchPass extends Pass {
  constructor(dt_size) {
    super();

    const shader = DigitalGlitch;
    this.uniforms = UniformsUtils.clone(shader.uniforms);

    if (dt_size == undefined) dt_size = 64;

    this.uniforms['tDisp'].value = this.generateHeightmap(dt_size);

    this.material = new ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,
    });

    this.fsQuad = new FullScreenQuad(this.material);

    this.goWild = false;
    this.curF = 0;
    this.generateTrigger();
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    this.uniforms['tDiffuse'].value = readBuffer.texture;
    this.uniforms['seed'].value = Math.random(); //default seeding
    this.uniforms['byp'].value = 0;

    if (this.curF % this.randX == 0 || this.goWild == true) {
      this.uniforms['amount'].value = Math.random() / 30;
      this.uniforms['angle'].value = tMath.randFloat(-Math.PI, Math.PI);
      this.uniforms['seed_x'].value = tMath.randFloat(-1, 1);
      this.uniforms['seed_y'].value = tMath.randFloat(-1, 1);
      this.uniforms['distortion_x'].value = tMath.randFloat(0, 1);
      this.uniforms['distortion_y'].value = tMath.randFloat(0, 1);
      this.curF = 0;
      this.generateTrigger();
    } else if (this.curF % this.randX < this.randX / 5) {
      this.uniforms['amount'].value = Math.random() / 90;
      this.uniforms['angle'].value = tMath.randFloat(-Math.PI, Math.PI);
      this.uniforms['distortion_x'].value = tMath.randFloat(0, 1);
      this.uniforms['distortion_y'].value = tMath.randFloat(0, 1);
      this.uniforms['seed_x'].value = tMath.randFloat(-0.3, 0.3);
      this.uniforms['seed_y'].value = tMath.randFloat(-0.3, 0.3);
    } else if (this.goWild == false) {
      this.uniforms['byp'].value = 1;
    }

    this.curF++;
    this.quad.material = this.material;

    if (this.renderToScreen) {
      renderer.setRenderTarget(null);
      this.fsQuad.render(renderer);
    } else {
      renderer.setRenderTarget(writeBuffer);
      if (this.clear) renderer.clear();
      this.fsQuad.render(renderer);
    }
  }

  generateTrigger() {
    this.randX = tMath.randInt(120, 240);
  }

  generateHeightmap(dt_size) {
    const data_arr = new Float32Array(dt_size * dt_size * 3);
    const length = dt_size * dt_size;

    for (let i = 0; i < length; i++) {
      const val = tMath.randFloat(0, 1);
      data_arr[i * 3 + 0] = val;
      data_arr[i * 3 + 1] = val;
      data_arr[i * 3 + 2] = val;
    }

    const texture = new DataTexture(
      data_arr,
      dt_size,
      dt_size,
      RGBFormat,
      FloatType
    );

    texture.needsUpdate = true;

    return texture;
  }
}
