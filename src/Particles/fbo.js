// import isMobile from '../utils/isMobile';
import THREE from '../utils/threeProxy';

class FBO {
    constructor({
        width,
        height,
        renderer,
        simulationMaterial,
        renderMaterial,
    }) {
        this.width = width;
        this.height = height;
        this.renderer = renderer;
        this.simulationMaterial = simulationMaterial;
        this.renderMaterial = renderMaterial;

        this.init();
    }

    init() {
        const gl = this.renderer.getContext();

        if (
            !this.renderer.capabilities.isWebGL2 &&
            !gl.getExtension('OES_texture_float')
        ) {
            throw new Error('float textures not supported');
        }

        if (this.renderer.capabilities.maxVertexTextures === 0) {
            throw new Error('vertex shader cannot read textures');
        }

        this.scene = new THREE.Scene();
        // prettier-ignore
        this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1 / Math.pow(2, 53), 1);

        const options = {
            wrapS: THREE.NearestFilter,
            wrapT: THREE.NearestFilter,
            minFilter: THREE.NearestFilter,
            magFilter: THREE.NearestFilter,

            format: THREE.RGBAFormat,
            type: /(iPad|iPhone|iPod)/g.test(navigator.userAgent)
                ? THREE.HalfFloatType
                : THREE.FloatType,
            stencilBuffer: false,
            depthBuffer: false,

            // format: RGBAFormat,
            // type: isMobile() ? HalfFloatType : FloatType,
            // stencilBuffer: false,
            // wrapS: ClampToEdgeWrapping,
            // wrapT: ClampToEdgeWrapping,
        };
        this.currentRenderTarget = this.renderer.getRenderTarget();
        this.rtt = new THREE.WebGLRenderTarget(
            this.width,
            this.height,
            options
        );
        this.renderMaterial.uniforms.positions.value = this.rtt.texture;

        const geom = new THREE.BufferGeometry();
        // prettier-ignore
        geom.addAttribute('position', new THREE.BufferAttribute(
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
        geom.addAttribute('uv', new THREE.BufferAttribute(
            new Float32Array([
                0,0, 1,0,
                1,1, 0,0,
                1,1, 0,1
            ]),
            2
        ));

        const mesh = new THREE.Mesh(geom, this.simulationMaterial);
        this.scene.add(mesh);
    }

    update() {
        this.renderer.setRenderTarget(this.rtt);
        this.renderer.render(this.scene, this.orthoCamera);
        this.renderer.setRenderTarget(this.currentRenderTarget);
    }
}
export default FBO;
