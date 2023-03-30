import * as THREE from 'three';
import { TWEEN } from '/node_modules/three/examples/jsm/libs/tween.module.min.js';
import Delayed from '../../../../core/helpers/delayed-call';
import RoomObjectAbstract from '../room-object.abstract';
import { AIR_CONDITIONER_PART_CONFIG, AIR_CONDITIONER_PART_TYPE } from './air-conditioner-data';
import ChairDebug from './air-conditioner-debug';

export default class AirConditioner extends RoomObjectAbstract {
  constructor(meshesGroup, roomObjectType) {
    super(meshesGroup, roomObjectType);

    this._airConditionerDebug = null;

    this._init();
  }

  showWithAnimation(delay) {
    super.showWithAnimation();

    this._airConditionerDebug.disable();
    this._setPositionForShowAnimation();

    Delayed.call(delay, () => {
      const fallDownTime = 600;

      const frame = this._parts[AIR_CONDITIONER_PART_TYPE.Frame];

      // new TWEEN.Tween(stand.position)
      //   .to({ y: stand.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .start();

      // new TWEEN.Tween(tube.position)
      //   .to({ y: tube.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .delay(250)
      //   .start();

      // new TWEEN.Tween(lamp.position)
      //   .to({ y: lamp.userData.startPosition.y }, fallDownTime)
      //   .easing(TWEEN.Easing.Sinusoidal.Out)
      //   .delay(500)
      //   .start()
      //   .onComplete(() => {
      //     this._chairDebug.enable();
      //     this._onShowAnimationComplete();
      //   });
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
    this._initParts(AIR_CONDITIONER_PART_TYPE, AIR_CONDITIONER_PART_CONFIG);
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
    const airConditionerDebug = this._airConditionerDebug = new ChairDebug();

    airConditionerDebug.events.on('switchOn', () => {
      console.log('switchOn');
    });
  }
}
