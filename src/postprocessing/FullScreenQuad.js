/**
 * @author Magnus Bergman <magnus@apt.no>
 */

const { OrthographicCamera, PlaneBufferGeometry, Mesh } = global.THREE;

const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
const geometry = new PlaneBufferGeometry(2, 2);

export default class FullScreenQuad {
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
