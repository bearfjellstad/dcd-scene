/**
 * @author alteredq / http://alteredqualia.com/
 */

import CopyShader from './shaders/CopyShader';
import ConvolutionShader from './shaders/ConvolutionShader';


const {
  WebGLRenderTarget,
  Vector2,
  UniformsUtils,
  ShaderMaterial,
  AdditiveBlending,
  LinearFilter,
  RGBAFormat,
} = THREE;

import Pass from './Pass';
import FullScreenQuad from './FullScreenQuad';

export default class BloomPass extends Pass {
  constructor(strength, kernelSize, sigma, resolution) {
    super();

    this.blurX = new Vector2(0.001953125, 0.0);
    this.blurY = new Vector2(0.0, 0.001953125);

    strength = strength !== undefined ? strength : 1;
    kernelSize = kernelSize !== undefined ? kernelSize : 25;
    sigma = sigma !== undefined ? sigma : 4.0;
    resolution = resolution !== undefined ? resolution : 256;

    // render targets

    const pars = {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
    };

    this.renderTargetX = new WebGLRenderTarget(resolution, resolution, pars);
    this.renderTargetX.texture.name = 'BloomPass.x';
    this.renderTargetY = new WebGLRenderTarget(resolution, resolution, pars);
    this.renderTargetY.texture.name = 'BloomPass.y';

    // copy material
    this.copyUniforms = UniformsUtils.clone(CopyShader.uniforms);

    this.copyUniforms['opacity'].value = strength;

    this.materialCopy = new ShaderMaterial({
      uniforms: this.copyUniforms,
      vertexShader: CopyShader.vertexShader,
      fragmentShader: CopyShader.fragmentShader,
      blending: AdditiveBlending,
      transparent: true,
    });

    // convolution material

    const convolutionShader = ConvolutionShader;

    this.convolutionUniforms = UniformsUtils.clone(convolutionShader.uniforms);

    this.convolutionUniforms['uImageIncrement'].value = this.blurX;
    this.convolutionUniforms['cKernel'].value = ConvolutionShader.buildKernel(
      sigma
    );

    this.materialConvolution = new ShaderMaterial({
      uniforms: this.convolutionUniforms,
      vertexShader: convolutionShader.vertexShader,
      fragmentShader: convolutionShader.fragmentShader,
      defines: {
        KERNEL_SIZE_FLOAT: kernelSize.toFixed(1),
        KERNEL_SIZE_INT: kernelSize.toFixed(0),
      },
    });

    this.needsSwap = false;

    this.fsQuad = new FullScreenQuad(null);
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    if (maskActive) renderer.context.disable(renderer.context.STENCIL_TEST);

    // Render quad with blured scene into texture (convolution pass 1)

    this.fsQuad.material = this.materialConvolution;

    this.convolutionUniforms['tDiffuse'].value = readBuffer.texture;
    this.convolutionUniforms['uImageIncrement'].value = this.blurX;

    renderer.setRenderTarget(this.renderTargetX);
    renderer.clear();
    this.fsQuad.render(renderer);

    // Render quad with blured scene into texture (convolution pass 2)

    this.convolutionUniforms['tDiffuse'].value = this.renderTargetX.texture;
    this.convolutionUniforms['uImageIncrement'].value = this.blurY;

    renderer.setRenderTarget(this.renderTargetY);
    renderer.clear();
    this.fsQuad.render(renderer);

    // Render original scene with superimposed blur to texture

    this.fsQuad.material = this.materialCopy;

    this.copyUniforms['tDiffuse'].value = this.renderTargetY.texture;

    if (maskActive) renderer.context.enable(renderer.context.STENCIL_TEST);

    renderer.setRenderTarget(readBuffer);
    if (this.clear) renderer.clear();
    this.fsQuad.render(renderer);
  }
}
