import * as THREE from 'three';
import RoomInactiveObjectAbstract from "../room-inactive-object-abstract";
import Loader from '../../../../core/loader';

export default class Picture extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);

    this._initPlane();
  }

  _initPlane() {
    const texture = Loader.assets['arcane-poster'];

    const geometry = new THREE.PlaneGeometry(1.48, 1.96);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = this._plane = new THREE.Mesh(geometry, material);
    this.add(plane);

    plane.rotation.y = Math.PI * 0.5;
    plane.position.copy(this._mesh.position);
  }
}
