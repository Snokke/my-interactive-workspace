import * as THREE from 'three';

export default class HeightMeter {
  constructor(wallHeight) {
    this._wallHeight = wallHeight;
    this._raycaster = null;

    this._raycaster = new THREE.Raycaster();
    this._direction = new THREE.Vector3(0, -1, 0);
  }

  getHeight(x, z, objects) {
    const origin = new THREE.Vector3(x, this._wallHeight, z);
    this._raycaster.set(origin, this._direction);

    const intersects = this._raycaster.intersectObjects(objects);

    if (intersects.length > 0) {
      const firstIntersectedObject = intersects[0];
      const height = this._wallHeight - firstIntersectedObject.distance;

      return height;
    }

    return 0;
  }
}
