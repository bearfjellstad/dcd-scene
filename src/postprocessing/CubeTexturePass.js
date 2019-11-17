/**
 * @author bhouston / http://clara.io/
 */


const {
  Scene,
  Mesh,
  BoxBufferGeometry,
  ShaderLib,
  ShaderMaterial,
  BackSide,
  PerspectiveCamera,
} = THREE;

import Pass from './Pass';

export default class CubeTexturePass extends Pass {
  constructor(camera, envMap, opacity) {
    super();

    this.camera = camera;

    this.needsSwap = false;

    this.cubeShader = ShaderLib['cube'];
    this.cubeMesh = new Mesh(
      new BoxBufferGeometry(10, 10, 10),
      new ShaderMaterial({
        uniforms: this.cubeShader.uniforms,
        vertexShader: this.cubeShader.vertexShader,
        fragmentShader: this.cubeShader.fragmentShader,
        depthTest: false,
        depthWrite: false,
        side: BackSide,
      })
    );

    this.envMap = envMap;
    this.opacity = opacity !== undefined ? opacity : 1.0;

    this.cubeScene = new Scene();
    this.cubeCamera = new PerspectiveCamera();
    this.cubeScene.add(this.cubeMesh);
  }

  render(renderer, writeBuffer, readBuffer, delta, maskActive) {
    const oldAutoClear = renderer.autoClear;
    renderer.autoClear = false;

    this.cubeCamera.projectionMatrix.copy(this.camera.projectionMatrix);
    this.cubeCamera.quaternion.setFromRotationMatrix(this.camera.matrixWorld);

    this.cubeMesh.material.uniforms['tCube'].value = this.envMap;
    this.cubeMesh.material.uniforms['opacity'].value = this.opacity;
    this.cubeMesh.material.transparent = this.opacity < 1.0;

    renderer.setRenderTarget(this.renderToScreen ? null : readBuffer);
    if (this.clear) renderer.clear();
    renderer.render(this.cubeScene, this.cubeCamera);

    renderer.autoClear = oldAutoClear;
  }
}
