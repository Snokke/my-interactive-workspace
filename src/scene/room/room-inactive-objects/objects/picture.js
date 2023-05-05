import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from "../../../../core/helpers/delayed-call";
import { ROOM_CONFIG } from "../../data/room-config";
import RoomInactiveObjectAbstract from "../room-inactive-object-abstract";
import Loader from '../../../../core/loader';

export default class Picture extends RoomInactiveObjectAbstract {
  constructor(roomScene, roomObjectType) {
    super(roomScene, roomObjectType);

    this._initPlane();
  }

  showWithAnimation(delay) {
    const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

    this._mesh.scale.set(0, 0, 0);

    Delayed.call(delay, () => {
      new TWEEN.Tween(this._mesh.scale)
        .to({ x: 1, y: 1, z: 1 }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectScaleEasing)
        .start();
    });
  }

  _initPlane() {
    const texture = Loader.assets['arcane-poster'];

    const geometry = new THREE.PlaneGeometry(1.48, 1.96);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const plane = new THREE.Mesh(geometry, material);
    this.add(plane);

    plane.rotation.y = Math.PI * 0.5;
    plane.position.copy(this._mesh.position);
  }
}
