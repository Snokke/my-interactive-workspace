import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import { ROOM_CONFIG, ROOM_OBJECT_ACTIVITY_TYPE, ROOM_OBJECT_CONFIG, ROOM_OBJECT_TYPE } from '../data/room-config';
import Delayed from '../../../core/helpers/delayed-call';

export default class RoomInactiveObjects extends THREE.Group {
  constructor(roomScene) {
    super();

    this._roomScene = roomScene;

    this._inactiveObjects = {};

    this._init();
  }

  showWithAnimation(type, delay) {
    const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

    const object = this._inactiveObjects[type];
    object.position.y = object.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;

    Delayed.call(delay, () => {
      new TWEEN.Tween(object.position)
        .to({ y: object.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();
    });
  }

  getInactiveMeshes() {
    return this._inactiveObjects;
  }

  _init() {
    for (const key in ROOM_OBJECT_TYPE) {
      const type = ROOM_OBJECT_TYPE[key];
      const config = ROOM_OBJECT_CONFIG[type];

      if (config.createObject && config.activityType === ROOM_OBJECT_ACTIVITY_TYPE.Inactive) {
        const object = this._roomScene.getObjectByName(config.meshName);

        object.userData['objectType'] = type;
        object.userData['startPosition'] = object.position.clone();

        this._inactiveObjects[type] = object;
      }
    }

    this._addMaterials();
  }

  _addMaterials() {
    for (const key in this._inactiveObjects) {
      const mesh = this._inactiveObjects[key];
      const material = new THREE.MeshStandardMaterial({
        color: `hsl(${Math.random() * 360}, 80%, 50%)`,
      });

      mesh.material = material;
    }
  }
}
