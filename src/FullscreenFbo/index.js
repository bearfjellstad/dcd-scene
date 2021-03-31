import basicVs from '../shaders/basic.vertex.glsl';
import defaultFs from './shaders/default.fs';

const {
    WebGLRenderTarget,
    Scene,
    Mesh,
    BufferAttribute,
    BufferGeometry,
    OrthographicCamera,
    ShaderMaterial,
    LinearFilter,
    NearestFilter,
    RGBAFormat,
} = global.THREE;

export default class FullscreenFbo {
    constructor({ width, height, renderer, material, uniforms }) {
        this.width = width;
        this.height = height;
        this.renderer = renderer;
        this.material = material;
        this.uniforms = uniforms;

        this.init();
    }

    init() {
        const renderTargetParams = {
            minFilter: LinearFilter,
            magFilter: NearestFilter,
            // format: RGBAFormat,
            stencilBuffer: false,
            depthBuffer: false,
        };
        this.rtA = new WebGLRenderTarget(
            this.width,
            this.height,
            renderTargetParams
        );
        this.rtB = this.rtA.clone();
        this.currentRenderTarget = this.renderer.getRenderTarget();

        this.sceneA = new Scene();
        this.sceneB = new Scene();
        // prettier-ignore
        this.orthoCamera = new OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

        const geom = new BufferGeometry();
        // prettier-ignore
        geom.addAttribute('position', new BufferAttribute(
            new Float32Array([
                -1, -1, 0,
                1, -1, 0,
                1, 1, 0,

                -1, -1, 0,
                1, 1, 0,
                -1, 1, 0
            ]),
            3
        ));
        // prettier-ignore
        geom.addAttribute('uv', new BufferAttribute(
            new Float32Array([
                0,0, 1,0,
                1,1, 0,0,
                1,1, 0,1
            ]),
            2
        ));

        this.setupMaterial();

        const meshA = new Mesh(geom, this.material);
        meshA.autoUpdate = false;
        this.sceneA.add(meshA);

        const meshB = new Mesh(geom, this.material);
        meshB.autoUpdate = false;
        this.sceneB.add(meshB);
    }

    setupMaterial() {
        if (!this.material) {
            this.material = new ShaderMaterial({
                vertexShader: basicVs,
                fragmentShader: defaultFs,
                uniforms: this.uniforms || {},
            });
        }

        this.material.uniforms.uTexture = { value: this.rtB.texture };
    }

    render() {
        this.renderer.setRenderTarget(this.rtA);
        this.renderer.render(this.sceneA, this.orthoCamera);
        this.renderer.setRenderTarget(this.currentRenderTarget);

        const tmp = this.rtA;
        this.rtA = this.rtB;
        this.rtB = tmp;

        this.material.uniforms.uTexture.value = this.rtB.texture;
    }

    getTexture() {
        return this.rtA.texture;
    }
}
