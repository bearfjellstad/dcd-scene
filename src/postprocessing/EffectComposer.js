/**
 * @author alteredq / http://alteredqualia.com/
 */

const {
    WebGLRenderTarget,
    OrthographicCamera,
    PlaneBufferGeometry,
    Mesh,
    Vector2,
    LinearFilter,
    RGBAFormat,
} = THREE;

import CopyShader from './shaders/CopyShader';
import ShaderPass from './ShaderPass';
import MaskPass from './MaskPass';
import ClearMaskPass from './ClearMaskPass';

export default class EffectComposer {
    constructor(renderer, renderTarget) {
        this.renderer = renderer;

        if (typeof renderTarget === 'undefined') {
            const parameters = {
                minFilter: LinearFilter,
                magFilter: LinearFilter,
                format: RGBAFormat,
                stencilBuffer: false,
            };

            const { width, height } = renderer.getDrawingBufferSize(
                new Vector2()
            );
            renderTarget = new WebGLRenderTarget(width, height, parameters);
            renderTarget.texture.name = 'EffectComposer.rt1';
        }

        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();
        this.renderTarget2.texture.name = 'EffectComposer.rt2';

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;

        this.renderToScreen = true;

        this.passes = [];

        this.copyPass = new ShaderPass(CopyShader);

        this._previousFrameTime = Date.now();
    }

    swapBuffers() {
        const tmp = this.readBuffer;
        this.readBuffer = this.writeBuffer;
        this.writeBuffer = tmp;
    }

    addPass(pass) {
        this.passes.push(pass);

        const size = this.renderer.getDrawingBufferSize(new Vector2());
        pass.setSize(size.width, size.height);
    }

    insertPass(pass, index) {
        this.passes.splice(index, 0, pass);
    }

    isLastEnabledPass(passIndex) {
        for (var i = passIndex + 1; i < this.passes.length; i++) {
            if (this.passes[i].enabled) {
                return false;
            }
        }

        return true;
    }

    render(delta = (Date.now() - this._previousFrameTime) * 0.001) {
        this._previousFrameTime = Date.now();

        let maskActive = false;
        const currentRenderTarget = this.renderer.getRenderTarget();

        for (let i = 0; i < this.passes.length; i++) {
            const pass = this.passes[i];

            if (pass.enabled === false) continue;

            pass.renderToScreen =
                this.renderToScreen && this.isLastEnabledPass(i);
            pass.render(
                this.renderer,
                this.writeBuffer,
                this.readBuffer,
                delta,
                maskActive
            );

            if (pass.needsSwap) {
                if (maskActive) {
                    const context = this.renderer.context;

                    context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

                    this.copyPass.render(
                        this.renderer,
                        this.writeBuffer,
                        this.readBuffer,
                        delta
                    );

                    context.stencilFunc(context.EQUAL, 1, 0xffffffff);
                }

                this.swapBuffers();
            }

            if (pass instanceof MaskPass) {
                maskActive = true;
            } else if (pass instanceof ClearMaskPass) {
                maskActive = false;
            }
        }

        this.renderer.setRenderTarget(currentRenderTarget);
    }

    reset(renderTarget) {
        if (typeof renderTarget === 'undefined') {
            const { width, height } = this.renderer.getDrawingBufferSize(
                new Vector2()
            );

            renderTarget = this.renderTarget1.clone();
            renderTarget.setSize(width, height);
        }

        this.renderTarget1.dispose();
        this.renderTarget2.dispose();
        this.renderTarget1 = renderTarget;
        this.renderTarget2 = renderTarget.clone();

        this.writeBuffer = this.renderTarget1;
        this.readBuffer = this.renderTarget2;
    }

    setSize(width, height) {
        this.renderTarget1.setSize(width, height);
        this.renderTarget2.setSize(width, height);

        for (let i = 0; i < this.passes.length; i++) {
            this.passes[i].setSize(width, height);
        }
    }
}

export class Pass {
    constructor() {
        // if set to true, the pass is processed by the composer
        this.enabled = true;

        // if set to true, the pass indicates to swap read and write buffer after rendering
        this.needsSwap = true;

        // if set to true, the pass clears its buffer before rendering
        this.clear = false;

        // if set to true, the result of the pass is rendered to screen
        this.renderToScreen = false;
    }

    setSize(width, height) {}

    render(renderer, writeBuffer, readBuffer, delta, maskActive) {
        console.error('Pass: .render() must be implemented in derived pass.');
    }
}

const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
const geometry = new PlaneBufferGeometry(2, 2);

export class FullScreenQuad {
    constructor(material) {
        this._mesh = new Mesh(geometry, material);
    }

    get material() {
        return this._mesh.material;
    }

    set material(value) {
        return (this._mesh.material = value);
    }

    render(renderer) {
        renderer.render(this._mesh, camera);
    }
}
