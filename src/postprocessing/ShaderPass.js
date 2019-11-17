/**
 * @author alteredq / http://alteredqualia.com/
 */

const { UniformsUtils, ShaderMaterial } = THREE;

import Pass from './Pass';
import FullScreenQuad from './FullScreenQuad';

export default class ShaderPass extends Pass {
    constructor(shader, textureID) {
        super();

        this.textureID = textureID || 'tDiffuse';

        if (shader instanceof ShaderMaterial) {
            this.uniforms = shader.uniforms;

            this.material = shader;
        } else if (shader) {
            this.uniforms = UniformsUtils.clone(shader.uniforms);

            this.material = new ShaderMaterial({
                defines: shader.defines || {},
                uniforms: this.uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader,
            });
        }

        this.fsQuad = new FullScreenQuad(this.material);
    }

    render(renderer, writeBuffer, readBuffer, delta, maskActive) {
        if (this.uniforms[this.textureID]) {
            this.uniforms[this.textureID].value = readBuffer.texture;
        }

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
