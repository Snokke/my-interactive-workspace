import * as THREE from 'three';

export default class Raycaster {
  constructor(camera) {

    this._camera = camera;

    this._raycaster = null;
    this._meshes = [];

    this._init();
  }

  checkIntersection(x, y) {
    const mousePositionX = (x / window.innerWidth) * 2 - 1;
    const mousePositionY = -(y / window.innerHeight) * 2 + 1;
    const mousePosition = new THREE.Vector2(mousePositionX, mousePositionY);

    this._raycaster.setFromCamera(mousePosition, this._camera);
    const intersects = this._raycaster.intersectObjects(this._meshes);

    let intersectedObject = null;

    if (intersects.length > 0) {
      intersectedObject = intersects[0].object;
    }

    return intersectedObject;
  }

  addMeshes(meshes) {
    this._meshes = [...this._meshes, ...meshes];
  }

  _init() {
    this._raycaster = new THREE.Raycaster();
  }
}
