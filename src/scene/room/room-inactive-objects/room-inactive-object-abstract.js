import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { ROOM_CONFIG, ROOM_OBJECT_CONFIG } from '../data/room-config';
import Delayed from '../../../core/helpers/delayed-call';

export default class RoomInactiveObjectAbstract extends THREE.Group {
  constructor(roomScene, roomObjectType) {
    super();

    this._roomScene = roomScene;
    this._roomObjectType = roomObjectType;

    this._mesh = null;

    this._init();
  }

  update(dt) { }

  showWithAnimation(delay) {
    this.visible = false;
    const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

    this._mesh.position.y = this._mesh.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;

    Delayed.call(delay, () => {
      this.visible = true;

      new TWEEN.Tween(this._mesh.position)
        .to({ y: this._mesh.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();
    });
  }

  getMesh() {
    return this._mesh;
  }

  _init() {
    this._initMesh();
    this._addMaterials();
  }

  _initMesh() {
    const config = ROOM_OBJECT_CONFIG[this._roomObjectType];

    const mesh = this._mesh = this._roomScene.getObjectByName(config.meshName);
    this.add(mesh);

    mesh.userData['objectType'] = this._roomObjectType;
    mesh.userData['startPosition'] = mesh.position.clone();
  }

  _addMaterials() {
    const material = new THREE.MeshStandardMaterial({
      color: `hsl(${Math.random() * 360}, 60%, 50%)`,
    });

    this._mesh.material = material;
  }
}
