import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { FLOOR_LAMP_PART_TYPE } from './floor-lamp-data';
import FloorLampDebugMenu from './floor-lamp-debug-menu';
import { ROOM_CONFIG } from '../../room-config';

export default class FloorLamp extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._debugMenu.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = ROOM_CONFIG.startAnimation.objectFallDownTime;

      const stand = this._parts[FLOOR_LAMP_PART_TYPE.Stand];
      const tube = this._parts[FLOOR_LAMP_PART_TYPE.Tube];
      const lamp = this._parts[FLOOR_LAMP_PART_TYPE.Lamp];

      new TWEEN.Tween(stand.position)
        .to({ y: stand.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .start();

      new TWEEN.Tween(tube.position)
        .to({ y: tube.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5)
        .start();

      new TWEEN.Tween(lamp.position)
        .to({ y: lamp.userData.startPosition.y }, fallDownTime)
        .easing(ROOM_CONFIG.startAnimation.objectFallDownEasing)
        .delay(fallDownTime * 0.5 * 2)
        .start()
        .onComplete(() => {
          this._debugMenu.enable();
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(intersect) {
    if (!this._isInputEnabled) {
      return;
    }

    console.log('Switch light');
  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _setPositionForShowAnimation() {
    for (let key in this._parts) {
      const part = this._parts[key];
      part.position.y = part.userData.startPosition.y + ROOM_CONFIG.startAnimation.startPositionY;
    }
  }

  _init() {
    this._initParts();
    this._addMaterials();
    this._addPartsToScene();
    this._initDebug();
  }

  _initDebug() {
    const debugMenu = this._debugMenu = new FloorLampDebugMenu();

    debugMenu.events.on('switchLight', () => {
      this.onClick();
    });
  }
}
