import THREE from '../utils/threeProxy';

let camera;
let geometry;

export default class FullScreenQuad {
    constructor(material) {
        if (!camera) {
            camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
            geometry = new THREE.PlaneBufferGeometry(2, 2);
        }

        this._mesh = new THREE.Mesh(geometry, material);
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
