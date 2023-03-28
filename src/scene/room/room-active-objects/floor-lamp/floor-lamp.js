import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { FLOOR_LAMP_PART_CONFIG, FLOOR_LAMP_PART_TYPE } from './floor-lamp-data';
import FloorLampDebug from './floor-lamp-debug';

export default class FloorLamp extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._floorLampDebug = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._floorLampDebug.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = 600;

      const stand = this._parts[FLOOR_LAMP_PART_TYPE.Stand];
      const tube = this._parts[FLOOR_LAMP_PART_TYPE.Tube];
      const lamp = this._parts[FLOOR_LAMP_PART_TYPE.Lamp];

      new TWEEN.Tween(stand.position)
        .to({ y: stand.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .start();

      new TWEEN.Tween(tube.position)
        .to({ y: tube.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .delay(250)
        .start();

      new TWEEN.Tween(lamp.position)
        .to({ y: lamp.userData.startPosition.y }, fallDownTime)
        .easing(TWEEN.Easing.Sinusoidal.Out)
        .delay(500)
        .start()
        .onComplete(() => {
          this._floorLampDebug.enable();
          this._onShowAnimationComplete();
        });
    });
  }

  onClick(roomObject) {
    if (!this._isInputEnabled) {
      return;
    }

  }

  getMeshesForOutline(mesh) {
    return this._activeMeshes;
  }

  _setPositionForShowAnimation() {
    const startPositionY = 13;

    for (let key in this._parts) {
      const part = this._parts[key];
      part.position.y = part.userData.startPosition.y + startPositionY;
    }
  }

  _init() {
    this._initParts(FLOOR_LAMP_PART_TYPE, FLOOR_LAMP_PART_CONFIG);
    this._addMaterials();
    this._addPartsToScene();
    this._initDebug();
  }

  _addPartsToScene() {
    for (let key in this._parts) {
      const part = this._parts[key];

      this.add(part);
    }
  }

  _initDebug() {
    const floorLampDebug = this._floorLampDebug = new FloorLampDebug();

    floorLampDebug.events.on('switchLight', () => {
      console.log('switchLight');
    });
  }
}
